import jwt from 'jsonwebtoken';
import { Client, Databases, Query } from 'appwrite';

// Ensure this matches the secret used to sign the token
const JWT_SECRET = process.env.JWT_SECRET;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const TABLE_ID  = process.env.APPWRITE_USERS_TABLE_ID;

export default async ({ req, res, log }) => {
    
    // 1. Get Token from Query Parameters
    const token = req.query.token;

    console.log("Received token:", token);

    if (!token) {
        log('Error: Missing verification token.');
        console.log("Redirecting due to missing token");
        return res.redirect('https://candle-light-studio-xaxc.vercel.app/verificationerror', 302);
    }

    if (!JWT_SECRET) {
        log('Configuration Error: JWT_SECRET not found.');
        return res.json({ success: false, message: 'Server configuration error.' }, 500);
    }

    try {
        // 2. Verify the Token and Extract Payload
        // This line throws an error if the token is expired, invalid, or tampered with.
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Extract the user identifier (email in your case)
        const userEmail = decoded.sub; 

        // 3. Initialize Appwrite SDK
        const client = new Client();
        client
            .setEndpoint(process.env.APPWRITE_ENDPOINT)
            .setProject(process.env.APPWRITE_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY); // Use your API Key for server-side access

        const databases = new Databases(client);

        // 4. Find the User Document
        // You'll need to query your collection to find the document based on the email.
        // Assuming you have an index on the 'email' attribute.
        log('DEBUG: Attempting to list documents...');
        const response = await databases.listDocuments(
            DATABASE_ID,
            TABLE_ID,
            [Query.equal('email', userEmail)]
        );
        log(`DEBUG: Documents found: ${response.documents.length}`);
        const userDoc = response.documents[0];

        if (!userDoc) {
            log('ERROR: User document not found for email.');
            return res.json({ status: 'error', code: 'user_not_found' }, 404);
        }

        // 5. Update the Verification Status
        log(`DEBUG: Attempting to update user ID ${userDoc.$id}`);
        await databases.updateDocument(
            DATABASE_ID,
            TABLE_ID,
            userDoc.$id,
            { isVerified: true }
        );

        log(`Successfully verified user: ${userEmail}`);
        
        // 6. Redirect to a Success Page
        return res.redirect('https://candle-light-studio-xaxc.vercel.app/book', 302);
        // return res.json({ status: 'success', redirectTo: '/book' }, 200);

    } catch (error) {
        log('Token Verification Failed: ' + error.message);
        
        // Redirect to an error page with specific message for the user
        let msg = 'invalid_token';
        if (error.name === 'TokenExpiredError') {
            msg = 'expired_token';
        }
        return res.redirect(`https://candle-light-studio-xaxc.vercel.app/verificationerror?msg=${msg}`, 302);
        // return res.json({ status: 'error', code: msg, redirectTo: '/verificationerror' }, 400);
    }
};