import nodemailer from 'nodemailer';

export default async ({ req, res, log }) => {
    
    // ✅ ADD CORS HEADERS FIRST - This allows your frontend to access the function
    res.headers = {
        'Access-Control-Allow-Origin': '*', // Or specify your domain: 'http://localhost:5173'
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.send('', 204);
    }

    // Validate POST request
    if (req.method !== 'POST' || !req.body) {
        return res.json({ success: false, message: 'Invalid request method or missing body.' }, 400);
    }

    try {
        const bookingData = JSON.parse(req.body);
        
        if (!bookingData.email || !bookingData.name || !bookingData.date) {
             log('Validation Error: Missing required booking details.');
             return res.json({ success: false, message: 'Missing required booking details.' }, 400);
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER, 
                pass: process.env.GMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: bookingData.email,
            subject: '✅ Your Appointment Confirmation',
            html: `
                <h1>Thank You for Booking, ${bookingData.name}!</h1>
                <p>Your appointment details are confirmed:</p>
                <ul>
                    <li><strong>Date:</strong> ${bookingData.date}</li>
                    <li><strong>Start Time:</strong> ${bookingData.startTime}</li>
                    <li><strong>Duration:</strong> ${bookingData.duration} minutes</li>
                    <li><strong>Email:</strong> ${bookingData.email}</li>
                </ul>
                <p>We look forward to seeing you!</p>
            `
        };

        await transporter.sendMail(mailOptions);
        log(`Confirmation email sent successfully to: ${bookingData.email}`);

        return res.json({ success: true, message: 'Email sent successfully.' });

    } catch (error) {
        log('Error sending email: ' + error.message);
        return res.json({ success: false, message: 'Internal server error: Email sending failed.' }, 500);
    }
};