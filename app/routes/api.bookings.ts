import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Client, Databases, Query, Functions } from "node-appwrite";

// Server-side Appwrite client with API key
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!); // This works with node-appwrite

const databases = new Databases(client);
const functions = new Functions(client);

// Handle GET requests (list bookings)
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const date = url.searchParams.get('date');

  if (!date) {
    return Response.json(
      { error: true, message: 'Date is required' },
      { status: 400 }
    );
  }

  try {
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_TABLE_ID!,
      [Query.equal("date", date)]
    );

    const bookings = response.documents;
    const timeRanges = bookings.map((b: any) => {
      const [hours, minutes] = b.startTime.split(":").map(Number);
      const startMin = hours * 60 + minutes;
      const endMin = startMin + b.duration;
      return { startMin, endMin };
    });

    return Response.json({ error: false, bookings, timeRanges });
  } catch (error: any) {
    console.error('List bookings error:', error);
    return Response.json(
      { error: true, message: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// Handle POST requests (create booking)
export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();
    const { booking } = body;

    const created = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_TABLE_ID!,
      'unique()',
      booking
    );

    // Fire-and-forget email (optional)
    if (process.env.APPWRITE_EMAIL_FUNCTION_ID) {
      functions
        .createExecution(
          process.env.APPWRITE_EMAIL_FUNCTION_ID,
          JSON.stringify(created),
          false
        )
        .catch((err) => {
          console.error('Email function error:', err);
        });
    }

    return Response.json({ error: false, booking: created });
  } catch (error: any) {
    console.error('Create booking error:', error);
    return Response.json(
      { error: true, message: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}