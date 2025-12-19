import { log } from 'console';
import { Client, Databases, Query, Functions} from 'node-appwrite'; // Added Query

const PROJECT_ID = process.env.PUBLIC_APPWRITE_PROJECT_ID;
const DATABASE_ID = process.env.PUBLIC_APPWRITE_DATABASE_ID;
const TABLE_ID = process.env.PUBLIC_APPWRITE_TABLE_ID;
const EMAIL_FUNCTION_ID = process.env.PUBLIC_APPWRITE_EMAIL_FUNCTION_ID;

if (!PROJECT_ID || !DATABASE_ID || !TABLE_ID || !EMAIL_FUNCTION_ID) {
  throw new Error("One or more required environment variables are missing.");
}
const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const databases = new Databases(client);
const functions = new Functions(client);

// Helper to handle CORS
const getCorsHeaders = (req) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
    : [];

  const origin = req.headers.origin;
  log("Request Origin:", origin); // Log the request origin
  const corsOrigin = origin && allowedOrigins.includes(origin) ? origin : "*";

  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
};

// Function to list bookings
const listBookings = async (date, res, corsHeaders) => {
  try {
    // Fixed: Changed tablesDB to databases
    // Fixed: Included DATABASE_ID as the first argument
    const response = await databases.listDocuments(
      DATABASE_ID, 
      TABLE_ID, 
      [Query.equal("date", date)]
    );
    const bookings = response.documents;
    const timeRanges = bookings.map(b => {
      const [hours, minutes] = b.startTime.split(":").map(Number);
      const startMin = hours * 60 + minutes;
      const endMin = startMin + b.duration;
      return { startMin, endMin };
    });
    // log("TimeRanges:", timeRanges);
    // log("List Bookings Response:", { bookings, timeRanges }); // Log the response from listing bookings
    return res.json({ error: false, bookings, timeRanges }, 200, corsHeaders);
  } catch (err) {
    log("Error listing bookings:", err.message); // Log the error if listing fails
    return res.json({ error: true, message: err.message }, 500, corsHeaders);
    
  }
};

// Function to create booking
const createBooking = async (booking, res, corsHeaders) => {
  try {
    // Fixed: Changed tablesDB to databases
    // Fixed: Included DATABASE_ID and 'unique()' for documentId
    const response = await databases.createDocument(
      DATABASE_ID, 
      TABLE_ID, 
      'unique()', 
      booking
    );
  log("Booking created successfully: sending email", response);

    // Send confirmation email  
  sendEmailConfirmation(response).catch(err => {
      log("Email failed but booking succeeded:", err.message);
    });

    // log("List Bookings Response:", { booking: response });
    return res.json({ error: false, booking: response }, 201, corsHeaders);
  } catch (err) {
    return res.json({ error: true, message: err.message }, 500, corsHeaders);
  }
};

// Main handler
export default async ({ req, res, log, error }) => { // Added log/error from context
  const corsHeaders = getCorsHeaders(req);
// log("Received request:", req.method, req.url); // Logging the request method and URL

  // Handle preflight
  if (req.method === "OPTIONS") {
    log("Handling OPTIONS preflight");
    return res.send("", 204, corsHeaders);
  }

  let body = {};
  try {
    // Appwrite functions usually provide req.body as an object or string
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (err) {
    error("JSON Parse Error: " + err.message);
    return res.json({ error: "Invalid JSON" }, 400, corsHeaders);
  }

  if (body.action === "list") {

    // log("Action: list" + body.date);
    return await listBookings(body.date, res, corsHeaders);
    
  }

  if (body.action === "create") {
    // log("Action: create");
    return await createBooking(body.booking, res, corsHeaders);
  }

  return res.json({ error: "Invalid action" }, 400, corsHeaders);
};

const sendEmailConfirmation = async (bookingDetails) => {
  log("Preparing to send email for booking:", bookingDetails);
    try {
        const execution = await functions.createExecution(
            EMAIL_FUNCTION_ID,
            JSON.stringify(bookingDetails), // body
            false // async execution
        );
        log("Email Function Execution Result:", execution);
        return execution;
        
    } catch (error) {
        console.error("Email Function Failed:", error);
        throw error;
    }
};
