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
    // --- CORS Handling Starts Here ---
    const ALLOWED_ORIGINS_STRING = process.env.ALLOWED_ORIGINS; 
    
    // Safely convert the comma-separated string into an array of origins
    const allowedOrigins = ALLOWED_ORIGINS_STRING 
        ? ALLOWED_ORIGINS_STRING.split(',').map(s => s.trim())
        : [];
        
    // Determine the requesting origin
    const requestOrigin = req.headers['origin'] || req.headers['referer']; 

    let corsOriginHeader = '*'; 

    // 🧠 2. Check if the request origin is in the allowed list
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
        corsOriginHeader = requestOrigin; // Echo back the specific allowed origin
    } else if (allowedOrigins.length === 0) {
        corsOriginHeader = '*';
    }
    
    // 3. Apply CORS headers
    res.headers = {
        'Access-Control-Allow-Origin': corsOriginHeader, 
        'Access-Control-Allow-Methods': 'GET, OPTIONS', // Note: Changed POST to GET for a fetch function
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight OPTIONS request from the browser
    if (req.method === 'OPTIONS') {
        return res.send('', 204);
    }
    
 
    try {
        //Fetch a list of photos from Unsplash
        const unsplashResponse = await unsplash.photos.list({
            page: 1,
            perPage: 10,
        });
        // ... (rest of error handling and return) ...
        
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
        // ... (original catch block) ...
        console.error('Function execution error:', e.message);
        return res.json({
            error: true,
            message: 'Internal server error while fetching photos.',
        }, 500);
    }
};