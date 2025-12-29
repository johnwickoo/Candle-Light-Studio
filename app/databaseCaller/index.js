import { Client, Databases, Query, Functions } from "node-appwrite";

export default async ({ req, res, log }) => {
  const client = new Client()
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject(process.env.PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);
  const functions = new Functions(client);

  // ---- CORS ----
  res.headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return res.send("", 204);
  }

  try {
    /* ======================
       GET → LIST BOOKINGS
       ====================== */
    if (req.method === "GET") {
      const date = req.query?.date;

      if (!date) {
        return res.json(
          { error: true, message: "date is required" },
          400
        );
      }

      const response = await databases.listDocuments(
        process.env.PUBLIC_APPWRITE_DATABASE_ID,
        process.env.PUBLIC_APPWRITE_TABLE_ID,
        [Query.equal("date", date)]
      );

      const bookings = response.documents;

      const timeRanges = bookings.map((b) => {
        const [h, m] = b.startTime.split(":").map(Number);
        const startMin = h * 60 + m;
        return { startMin, endMin: startMin + b.duration };
      });

      return res.json({ error: false, bookings, timeRanges });
    }

    /* ======================
       POST → CREATE BOOKING
       ====================== */
    if (req.method === "POST") {
      const body =
        typeof req.body === "string"
          ? JSON.parse(req.body)
          : req.body;

      const { booking } = body;

      if (!booking) {
        return res.json(
          { error: true, message: "booking required" },
          400
        );
      }

      const created = await databases.createDocument(
        process.env.PUBLIC_APPWRITE_DATABASE_ID,
        process.env.PUBLIC_APPWRITE_TABLE_ID,
        "unique()",
        booking
      );

      if (process.env.PUBLIC_APPWRITE_EMAIL_FUNCTION_ID) {
        functions.createExecution(
          process.env.PUBLIC_APPWRITE_EMAIL_FUNCTION_ID,
          JSON.stringify(created),
          false
        );
      }

      return res.json({ error: false, booking: created }, 201);
    }

    return res.json(
      { error: true, message: "Method not allowed" },
      405
    );
  } catch (err) {
    log("Function error:", err);
    return res.json(
      { error: true, message: "Server error" },
      500
    );
  }
};
