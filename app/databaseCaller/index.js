import { Client, Databases, Query, Functions } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const functions = new Functions(client);

export default async ({ req, res, log }) => {
  // ---- CORS ----
  const corsHeaders = {
    'Access-Control-Allow-Origin': ' * ',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    res.headers = corsHeaders;
    return res.send('', 204);
  }

  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body;
    res.headers = corsHeaders;
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
      log("List Bookings Response:", { bookings, timeRanges }); // Log the response from listing bookings
      return res.json({ error: false, bookings, timeRanges }, 200, corsHeaders);
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
        .catch(() => {});

      return res.send(
        JSON.stringify({ error: false, booking: created }),
        201,corsHeaders
      );
    }

    return res.send(
      JSON.stringify({ error: true, message: 'Invalid action' }),
      400,corsHeaders
    );
  } catch (err) {
    log('DB function error:', err?.message || err);
    res.headers = corsHeaders;
    return res.send(
      JSON.stringify({ error: true, message: 'Server error' }),
      500,corsHeaders
    );
  }
};
