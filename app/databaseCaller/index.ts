import { Client, Databases, Query, Functions, Models } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const functions = new Functions(client);

export default async function handler(req: { method: string; body: { action?: any; date?: any; booking?: any; }; }, res: { setHeader: (arg0: string, arg1: string) => void; status: (arg0: number) => { (): any; new(): any; end: { (): any; new(): any; }; json: { (arg0: { error: boolean; bookings?: Models.DefaultDocument[]; booking?: Models.DefaultDocument; message?: string; }): any; new(): any; }; }; }) {
  // --- CORS ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { action } = req.body;

    if (action === 'list') {
      const { date } = req.body;

      const response = await databases.listDocuments(
        process.env.PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.PUBLIC_APPWRITE_TABLE_ID!,
        [Query.equal('date', date)]
      );

      return res.status(200).json({
        error: false,
        bookings: response.documents,
      });
    }

    if (action === 'create') {
      const { booking } = req.body;

      const created = await databases.createDocument(
        process.env.PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.PUBLIC_APPWRITE_TABLE_ID!,
        'unique()',
        booking
      );

      // Fire-and-forget email
      functions.createExecution(
        process.env.PUBLIC_APPWRITE_EMAIL_FUNCTION_ID!,
        JSON.stringify(created),
        false
      ).catch(() => {});

      return res.status(201).json({
        error: false,
        booking: created,
      });
    }

    return res.status(400).json({ error: true, message: 'Invalid action' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: true, message: 'Server error' });
  }
}
