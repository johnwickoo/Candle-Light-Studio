import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApi } from 'unsplash-js';

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY as string,
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: true, message: 'Method not allowed' });
  }

  try {
    const response = await unsplash.photos.list({
      page: 1,
      perPage: 12,
    });

    if (response.type === 'error') {
      return res.status(500).json({
        error: true,
        message: response.errors.join(', '),
      });
    }

    return res.status(200).json({
      error: false,
      photos: response.response.results,
    });
  } catch (err: any) {
    console.error('Unsplash Error:', err);
    return res.status(500).json({
      error: true,
      message: 'Gallery fetch failed',
      details: err.message,
    });
  }
}