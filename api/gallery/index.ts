// api/gallery/index.ts
export default async function handler(req: any, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: boolean; message: string; }): any; new(): any; }; }; }) {
  try {
    const r = await fetch(
      'https://6932a4ba000599fc5758.fra.appwrite.run',
      { method: 'GET' }
    );

    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({
      error: true,
      message: 'Gallery proxy failed',
    });
  }
}
