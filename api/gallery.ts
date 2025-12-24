import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const r = await fetch('https://6932a4ba000599fc5758.fra.appwrite.run', { 
      method: 'GET' 
    });

    const data = await r.json();

    // Appwrite preference: Send data, status, and headers
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: true, message: 'Proxy failed' });
  }
}