import { Client, Databases, Query, Functions } from "node-appwrite";

export default async ({ req, res, log }) => {
  /* -------------------- CORS -------------------- */
  res.headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return res.send("", 204);
  }

  /* -------------------- CLIENT -------------------- */
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);
  const functions = new Functions(client);

  try {
    /* ==================== LIST BOOKINGS ==================== */
    if (req.method === "GET") {
      const date = req.query?.date;

      if (!date) {
        return res.json(
          { error: true, message: "Date query parameter is required" },
          400
        );
      }

      const response = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_COLLECTION_ID,
        [Query.equal("date", date)]
      );

      const bookings = response.documents;

      const timeRanges = bookings.map((b) => {
        const [h, m] = b.startTime.split(":").map(Number);
        const startMin = h * 60 + m;
        return {
          startMin,
          endMin: startMin + b.duration,
        };
      });

      log("Bookings fetched:", bookings.length);

      return res.json({
        error: false,
        bookings,
        timeRanges,
      });
    }

    /* ==================== CREATE BOOKING ==================== */
    if (req.method === "POST") {
      const { booking } =
        typeof req.body === "string"
          ? JSON.parse(req.body)
          : req.body || {};

      if (!booking) {
        return res.json(
          { error: true, message: "Booking payload is required" },
          400
        );
      }

      const created = await databases.createDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_COLLECTION_ID,
        "unique()",
        booking
      );

      /* fire-and-forget email */
      if (process.env.APPWRITE_EMAIL_FUNCTION_ID) {
        functions
          .createExecution(
            process.env.APPWRITE_EMAIL_FUNCTION_ID,
            JSON.stringify(created),
            false
          )
          .catch((err) => log("Email function error:", err));
      }

      return res.json(
        { error: false, booking: created },
        201
      );
    }

    return res.json(
      { error: true, message: "Method not allowed" },
      405
    );
  } catch (err) {
    log("Function error:", err?.message || err);
    return res.json(
      { error: true, message: "Internal server error" },
      500
    );
  }
};
        return res.json({ success: true, message: 'Email verified successfully.' }, 200);