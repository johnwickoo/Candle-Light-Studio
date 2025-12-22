import { createApi } from 'unsplash-js';
import { Basic } from 'unsplash-js/dist/methods/photos/types';

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
});

export default async function handler(req: { method: string; }, res: { setHeader: (arg0: string, arg1: string) => void; status: (arg0: number) => { (): any; new(): any; end: { (): any; new(): any; }; json: { (arg0: { error: boolean; message?: string; photos?: Basic[]; }): any; new(): any; }; }; }) {
  // --- CORS ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

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
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: true,
      message: 'Gallery fetch failed',
    });
  }
}
