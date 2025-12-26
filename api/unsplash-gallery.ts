// import { createApi } from 'unsplash-js';
// import type { VercelRequest, VercelResponse } from '@vercel/node';

// // Vercel has built-in fetch support in Node 18+, 
// // so we don't need to import node-fetch manually.
// const unsplash = createApi({
//   accessKey: process.env.UNSPLASH_ACCESS_KEY as string,
//   fetch: fetch,
// });

// export default async function handler(req: VercelRequest, res: VercelResponse) {
//   // 1. Set CORS Headers manually for Vercel
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

//   // 2. Handle Preflight OPTIONS request
//   if (req.method === 'OPTIONS') {
//     return res.status(204).end();
//   }

//   try {
//     // 3. Call Unsplash directly from Vercel's server
//     const response = await unsplash.photos.list({
//       page: 1,
//       perPage: 12,
//     });

//     if (response.type === 'error') {
//       return res.status(500).json({ 
//         error: true, 
//         message: response.errors.join(', ') 
//       });
//     }

//   console.log('Vercel Unsplash Response:', response); 
//     return res.status(200).json({
//       error: false,
//       photos: response.response.results
//     });

//   } catch (err: any) {
//     console.error('Vercel Unsplash Error:', err);
//     return res.status(500).json({ 
//       error: true, 
//       message: 'Gallery fetch failed from Vercel side',
//       details: err.message
//     });
//   }
// }