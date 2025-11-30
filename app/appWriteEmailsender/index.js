import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

// --- JWT Generation Function ---
// The secret key is passed as an argument from the environment variable
function generateVerificationToken(userId, secret) { 
    const payload = {
        sub: userId,
        type: 'email_verification'
    };
    const options = {
        expiresIn: '1h',
        issuer: 'YourAppName'
    };
    
    // Uses the securely passed secret to sign the token
    const token = jwt.sign(payload, secret, options); 
    return token;
}


export default async ({ req, res, log }) => {
    
    // ... CORS handling remains the same ...
    res.headers = {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (req.method === 'OPTIONS') {
        return res.send('', 204);
    }

    if (req.method !== 'POST' || !req.body) {
        return res.json({ success: false, message: 'Invalid request method or missing body.' }, 400);
    }

    // --- SECURITY CHECK: Load Secrets from Appwrite Environment ---
    const JWT_SECRET = process.env.JWT_SECRET;
    const GMAIL_USER = process.env.GMAIL_USER;
    const GMAIL_PASS = process.env.GMAIL_PASS;

    if (!JWT_SECRET || !GMAIL_USER || !GMAIL_PASS) {
        log('Configuration Error: Missing required environment variables.');
        return res.json({ success: false, message: 'Server configuration error.' }, 500);
    }
    // -----------------------------------------------------------

    try {
        const bookingData = JSON.parse(req.body);
        
        if (!bookingData.email || !bookingData.name || !bookingData.date || !bookingData.startTime || !bookingData.duration) {
             log('Validation Error: Missing required booking details.');
             return res.json({ success: false, message: 'Missing required booking details.' }, 400);
        }

        // --- Generate Token and Link ---
        // 🔑 PASS the retrieved JWT_SECRET to the generator function

        const BASE_VERIFICATION_URL = 'https://692c66e00024652f6922.fra.appwrite.run/'; // Your Appwrite Function URL for verification
        const verificationToken = generateVerificationToken(bookingData.email, JWT_SECRET); 
        
        // ⚠️ Set your actual frontend domain here
       const verificationLink = `${BASE_VERIFICATION_URL}?token=${verificationToken}`
        // --------------------------------

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: GMAIL_USER, 
                pass: GMAIL_PASS
            }
        });

        const mailOptions = {
            from: GMAIL_USER,
            to: bookingData.email,
            subject: '✅ Your Appointment Confirmation (Verification Required)',
            html: `
                <h1>Thank You for Booking, ${bookingData.name}!</h1>
                <p>Your appointment details are confirmed:</p>
                <ul>
                    <li><strong>Date:</strong> ${bookingData.date}</li>
                    <li><strong>Start Time:</strong> ${bookingData.startTime}</li>
                    <li><strong>Duration:</strong> ${bookingData.duration} minutes</li>
                    <li><strong>Email:</strong> ${bookingData.email}</li>
                </ul>
                <hr>
                <h2>Account Verification Required</h2>
                <p>Before your booking is fully confirmed, please verify your email address by clicking the link below:</p>
                <a href="${verificationLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                    Verify My Email Address
                </a>
                <p>This link is valid for 1 hour.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        log(`Confirmation and verification email sent to: ${bookingData.email}`);

        return res.json({ success: true, message: 'Email sent successfully. Please check your inbox to verify.' });

    } catch (error) {
        log('Error sending email: ' + error.message);
        return res.json({ success: false, message: 'Internal server error: Email sending failed.' }, 500);
    }
};