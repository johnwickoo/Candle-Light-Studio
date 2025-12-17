import { log } from 'console';
import { Client, Databases, Query } from 'node-appwrite'; // Added Query

const PROJECT_ID = process.env.PUBLIC_APPWRITE_PROJECT_ID;
const DATABASE_ID = process.env.PUBLIC_APPWRITE_DATABASE_ID;
const TABLE_ID = process.env.PUBLIC_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const databases = new Databases(client);

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

    return res.json({ error: false, bookings: response.documents }, 200, corsHeaders);
  } catch (err) {
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
    return res.json({ error: false, booking: response }, 201, corsHeaders);
  } catch (err) {
    return res.json({ error: true, message: err.message }, 500, corsHeaders);
  }
};

// Main handler
export default async ({ req, res, log, error }) => { // Added log/error from context
  const corsHeaders = getCorsHeaders(req);
log("Received request:", req.method, req.url); // Logging the request method and URL

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
    log("Action: list");
    return await listBookings(body.date, res, corsHeaders);
    log("Listed bookings for date:", body.date); // Log after listing bookings
  }

  if (body.action === "create") {
    log("Action: create");
    return await createBooking(body.booking, res, corsHeaders);
  }

  return res.json({ error: "Invalid action" }, 400, corsHeaders);
};