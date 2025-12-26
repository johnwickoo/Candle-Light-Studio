import { createApi } from 'unsplash-js';
import { NextResponse } from 'next/server';

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY as string,
});

export async function GET(request: Request) {
  try {
    const response = await unsplash.photos.list({
      page: 1,
      perPage: 12,
    });

    if (response.type === 'error') {
      return NextResponse.json(
        { 
          error: true, 
          message: response.errors.join(', ') 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      error: false,
      photos: response.response.results
    });

  } catch (err: any) {
    console.error('Unsplash Error:', err);
    return NextResponse.json(
      { 
        error: true, 
        message: 'Gallery fetch failed',
        details: err.message
      },
      { status: 500 }
    );
  }
}