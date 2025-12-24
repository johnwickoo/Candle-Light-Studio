import { Client, Databases, Query, Functions } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const functions = new Functions(client);

export default async ({ req, res, log }) => {
  // ---- CORS ----
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
        [Query.equal('date', date)]
      );

      return res.json(
        { error: false, bookings: response.documents },
        200
      );
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

      return res.json(
        { error: false, booking: created },
        201
      );
    }

    return res.json(
      { error: true, message: 'Invalid action' },
      400
    );
  } catch (err) {
    log('DB function error:', err.message);
    return res.json(
      { error: true, message: 'Server error' },
      500
    );
  }
};
