import { createApi } from 'unsplash-js';

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY as string,
});

export async function loader() {
  try {
    const response = await unsplash.photos.list({
      page: 1,
      perPage: 12,
    });

    if (response.type === 'error') {
      return Response.json(
        { 
          error: true, 
          message: response.errors.join(', ') 
        },
        { status: 500 }
      );
    }

    return Response.json({
      error: false,
      photos: response.response.results
    });

  } catch (err: any) {
    console.error('Unsplash Error:', err);
    return Response.json(
      { 
        error: true, 
        message: 'Gallery fetch failed',
        details: err.message
      },
      { status: 500 }
    );
  }
}