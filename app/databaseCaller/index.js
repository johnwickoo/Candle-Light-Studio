import { Client, TablesDB, Functions } from "appwrite";

const PROJECT_ID = process.env.PUBLIC_APPWRITE_PROJECT_ID;
const DATABASE_ID = process.env.PUBLIC_APPWRITE_DATABASE_ID;
const TABLE_ID = process.env.PUBLIC_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const tablesDB = new TablesDB(client);
const functions = new Functions(client);


// Helper to handle CORS
const getCorsHeaders = (req) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
    : [];


  const origin = req.headers.origin;
  const corsOrigin = origin && allowedOrigins.includes(origin) ? origin : "*";

  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
};

// Function to list bookings
const listBookings = async (date, res, corsHeaders) => {
  try {
    const response = await tablesDB.listDocuments(TABLE_ID, [
      // Example filter: you can adjust according to your schema
      // Query.equal("date", date)
    ]);

    return res.json({ error: false, bookings: response.documents }, 200, corsHeaders);
  } catch (err) {
    return res.json({ error: true, message: err.message }, 500, corsHeaders);
  }
};

// Function to create booking
const createBooking = async (booking, res, corsHeaders) => {
  try {
    const response = await tablesDB.createDocument(TABLE_ID, booking);
    return res.json({ error: false, booking: response }, 201, corsHeaders);
  } catch (err) {
    return res.json({ error: true, message: err.message }, 500, corsHeaders);
  }
};

// Main handler
export default async ({ req, res }) => {
  log("Request origin:", req.headers.origin);
  log("Allowed origins:", process.env.ALLOWED_ORIGINS);

  const corsHeaders = getCorsHeaders(req);

  

  // 1️⃣ Handle preflight
  if (req.method === "OPTIONS") {
    return res.send("", 204, corsHeaders);
  }

  // 2️⃣ Parse JSON body safely
  let body = {};
  try {
    body = JSON.parse(req.body || "{}");
  } catch (err) {
    return res.json({ error: "Invalid JSON" }, 400, corsHeaders);
  }

  // 3️⃣ Route actions
  if (body.action === "list") {
    return listBookings(body.date, res, corsHeaders);
  }

  if (body.action === "create") {
    return createBooking(body.booking, res, corsHeaders);
  }

  // 4️⃣ Default fallback
  return res.json({ error: "Invalid action" }, 400, corsHeaders);
};
