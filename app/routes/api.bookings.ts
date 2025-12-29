import type { Route } from "./+types/api.bookings";
import { Client, Databases, Query, Functions } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const functions = new Functions(client);

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const date = url.searchParams.get('date');

  if (!date) {
    return Response.json({ 
      error: true, 
      message: 'Date parameter is required' 
    }, { status: 400 });
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

    return Response.json({ 
      error: false, 
      bookings, 
      timeRanges 
    });
  } catch (error: any) {
    console.error('List bookings error:', error);
    return Response.json({ 
      error: true, 
      message: error.message || 'Failed to fetch bookings' 
    }, { status: 500 });
  }
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return Response.json({ 
      error: true, 
      message: 'Method not allowed' 
    }, { status: 405 });
  }

  try {
    const { booking } = await request.json();

    if (!booking) {
      return Response.json({ 
        error: true, 
        message: 'Booking data is required' 
      }, { status: 400 });
    }

    const created = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_TABLE_ID!,
      'unique()',
      booking
    );

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

    return Response.json({ 
      error: false, 
      booking: created 
    });
  } catch (error: any) {
    console.error('Create booking error:', error);
    return Response.json({ 
      error: true, 
      message: error.message || 'Failed to create booking' 
    }, { status: 500 });
  }
}