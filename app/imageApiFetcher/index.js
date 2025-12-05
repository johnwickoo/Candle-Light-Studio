

import { createApi } from 'unsplash-js';
import fetch from 'node-fetch'; // Required for server-side use

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!UNSPLASH_ACCESS_KEY) {
    throw new Error('Appwrite environment variable UNSPLASH_ACCESS_KEY is not set.');
}

const unsplash = createApi({
    accessKey: UNSPLASH_ACCESS_KEY,
    fetch: fetch,
});

export default async ({ req, res }) => {
    try {
        //Fetch a list of photos from Unsplash
        const unsplashResponse = await unsplash.photos.list({
            page: 1,
            perPage: 10,
        });

        //Check for errors from Unsplash API
        if (unsplashResponse.type === 'error') {
            return res.json({
                error: true,
                message: unsplashResponse.errors.join(', '),
            }, 500);
        }

        //Return the photo data to the frontend
        return res.json({
            error: false,
            photos: unsplashResponse.response.results,
        });

    } catch (e) {
        console.error('Function execution error:', e.message);
        return res.json({
            error: true,
            message: 'Internal server error while fetching photos.',
        }, 500);
    }
};