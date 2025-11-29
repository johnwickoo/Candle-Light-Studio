import nodemailer from 'nodemailer';

// The main function executed by Appwrite when the HTTP endpoint is hit
export default async ({ req, res, log }) => {
    
    // 1. Basic Request Validation
    // Ensure the request is a POST method and contains a body (the booking data)
    if (req.method !== 'POST' || !req.body) {
        return res.json({ success: false, message: 'Invalid request method or missing body.' }, 400);
    }

    try {
        // 2. Parse the booking data sent from the React form (via fetch)
        const bookingData = JSON.parse(req.body);
        
        // Basic check for required fields
        if (!bookingData.email || !bookingData.name || !bookingData.date) {
             log('Validation Error: Missing required booking details.');
             return res.json({ success: false, message: 'Missing required booking details.' }, 400);
        }

        // 3. Configure the Nodemailer transporter (SMTP connection details)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                // Use the environment variables set in Appwrite settings
                user: process.env.GMAIL_USER, 
                pass: process.env.GMAIL_PASS  // The 16-character App Password
            }
        });

        // 4. Define the email content
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: bookingData.email, // Recipient email from the form data
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

        // 5. Send the email
        await transporter.sendMail(mailOptions);
        log(`Confirmation email sent successfully to: ${bookingData.email}`);

        // 6. Return a successful HTTP response
        return res.json({ success: true, message: 'Email sent successfully.' });

    } catch (error) {
        log('Error sending email: ' + error.message);
        // Return a server error response
        return res.json({ success: false, message: 'Internal server error: Email sending failed.' }, 500);
    }
};