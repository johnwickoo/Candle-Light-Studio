import { Client, Databases, Query, Functions } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const functions = new Functions(client);

export default async ({ req, res, log }) => {
  // ---- CORS Headers ----
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Set CORS headers immediately
  res.headers = corsHeaders;

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.send('', 204);
  }

  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body;
    
    const { action } = body;

    // LIST BOOKINGS
    if (action === 'list') {
      const { date } = body;

      const response = await databases.listDocuments(
        process.env.PUBLIC_APPWRITE_DATABASE_ID,
        process.env.PUBLIC_APPWRITE_TABLE_ID,
        [Query.equal("date", date)]
      );
      
      const bookings = response.documents;
      const timeRanges = bookings.map(b => {
        const [hours, minutes] = b.startTime.split(":").map(Number);
        const startMin = hours * 60 + minutes;
        const endMin = startMin + b.duration;
        return { startMin, endMin };
      });
      
      log("TimeRanges:", timeRanges);
      log("List Bookings Response:", { bookings, timeRanges });
      
      return res.json({ error: false, bookings, timeRanges }, 200);
    }

    // CREATE BOOKING
    if (action === 'create') {
      const { booking } = body;

      const created = await databases.createDocument(
        process.env.PUBLIC_APPWRITE_DATABASE_ID,
        process.env.PUBLIC_APPWRITE_TABLE_ID,
        'unique()',
        booking
      );

      // Fire-and-forget email
      functions
        .createExecution(
          process.env.PUBLIC_APPWRITE_EMAIL_FUNCTION_ID,
          JSON.stringify(created),
          false
        )
        .catch((err) => {
          log('Email function error:', err);
        });

      return res.json({ error: false, booking: created }, 201);
    }

    return res.json({ error: true, message: 'Invalid action' }, 400);
    
  } catch (err) {
    log('DB function error:', err?.message || err);
    return res.json(
      { error: true, message: err?.message || 'Server error' },
      500
    );
  }
};