import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client, Databases, Query, Functions } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const functions = new Functions(client);

// THIS MUST BE A DEFAULT EXPORT
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      return res.status(400).json({ 
        error: true, 
        message: 'Date parameter is required' 
      });
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

      return res.status(200).json({ 
        error: false, 
        bookings, 
        timeRanges 
      });
    } catch (error: any) {
      console.error('List bookings error:', error);
      return res.status(500).json({ 
        error: true, 
        message: error.message || 'Failed to fetch bookings' 
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { booking } = req.body;

      if (!booking) {
        return res.status(400).json({ 
          error: true, 
          message: 'Booking data is required' 
        });
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

      return res.status(200).json({ 
        error: false, 
        booking: created 
      });
    } catch (error: any) {
      console.error('Create booking error:', error);
      return res.status(500).json({ 
        error: true, 
        message: error.message || 'Failed to create booking' 
      });
    }
  }

  return res.status(405).json({ 
    error: true, 
    message: 'Method not allowed' 
  });
}