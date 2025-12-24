import { createApi } from 'unsplash-js';
import fetch from 'node-fetch';

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
  fetch,
});

export default async ({ req, res }) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.send('', 204);
  }

  try {
    const response = await unsplash.photos.list({
      page: 1,
      perPage: 12,
    });

    if (response.type === 'error') {
      return res.json({ error: true, message: response.errors.join(', ') }, 500);
    }

    return res.json(
      { error: false, photos: response.response.results },
      200
    );
  } catch (err) {
    console.error(err);
    return res.json(
      { error: true, message: 'Gallery fetch failed' },
      500
    );
  }
};
