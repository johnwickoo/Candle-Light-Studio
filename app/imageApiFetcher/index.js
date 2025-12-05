import { createApi } from 'unsplash-js';
import fetch from 'node-fetch';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!UNSPLASH_ACCESS_KEY) {
  throw new Error('Appwrite environment variable UNSPLASH_ACCESS_KEY is not set.');
}

const unsplash = createApi({
  accessKey: UNSPLASH_ACCESS_KEY,
  fetch: fetch,
});

export default async ({ req, res }) => {
  // --- CORS ---
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
    : [];

  const origin = req.headers.origin;

  let corsOrigin = '*';
  if (origin && allowedOrigins.includes(origin)) {
    corsOrigin = origin;
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.send('', 204, corsHeaders);
  }

  try {
    const unsplashResponse = await unsplash.photos.list({
      page: 1,
      perPage: 10,
    });

    if (unsplashResponse.type === 'error') {
      return res.json(
        {
          error: true,
          message: unsplashResponse.errors.join(', '),
        },
        500,
        corsHeaders
      );
    }

    return res.json(
      {
        error: false,
        photos: unsplashResponse.response.results,
      },
      200,
      corsHeaders
    );

  } catch (e) {
    console.error('Function execution error:', e.message);

    return res.json(
      {
        error: true,
        message: 'Internal server error while fetching photos.',
      },
      500,
      corsHeaders
    );
  }
};
