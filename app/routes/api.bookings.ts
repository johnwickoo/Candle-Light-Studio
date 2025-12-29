// app/routes/api.bookings.tsx (or .ts)
import { Client, Databases, Query, Functions } from 'node-appwrite';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';

// Server-side only Appwrite client
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const functions = new Functions(client);

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const date = url.searchParams.get('date');

  if (!date) {
    return new Response(
      JSON.stringify({ 
        error: true, 
        message: 'Date parameter is required' 
      }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
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

    return new Response(
      JSON.stringify({ 
        error: false, 
        bookings, 
        timeRanges 
      }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('List bookings error:', error);
    return new Response(
      JSON.stringify({ 
        error: true, 
        message: error.message || 'Failed to fetch bookings' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ 
        error: true, 
        message: 'Method not allowed' 
      }), 
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { booking } = await request.json();

    if (!booking) {
      return new Response(
        JSON.stringify({ 
          error: true, 
          message: 'Booking data is required' 
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
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

    return new Response(
      JSON.stringify({ 
        error: false, 
        booking: created 
      }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Create booking error:', error);
    return new Response(
      JSON.stringify({ 
        error: true, 
        message: error.message || 'Failed to create booking' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// CRITICAL: Mark this as a resource route (API only, no UI)
export const handle = {
  // This prevents the route from being treated as a UI route
};