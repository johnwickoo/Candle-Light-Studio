import { Client, Databases, Query, Functions } from "node-appwrite";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const functions = new Functions(client);

/* -------------------- GET BOOKINGS -------------------- */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  if (!date) {
    return new Response(
      JSON.stringify({ error: true, message: "date is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_COLLECTION_ID!,
      [Query.equal("date", date)]
    );

    const bookings = response.documents;

    const timeRanges = bookings.map((b: any) => {
      const [h, m] = b.startTime.split(":").map(Number);
      const startMin = h * 60 + m;
      return { startMin, endMin: startMin + b.duration };
    });

    return new Response(
      JSON.stringify({ error: false, bookings, timeRanges }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: true, message: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/* -------------------- CREATE BOOKING -------------------- */
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: true, message: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { booking } = await request.json();

    const created = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_COLLECTION_ID!,
      "unique()",
      booking
    );

    // Optional background email
    if (process.env.APPWRITE_EMAIL_FUNCTION_ID) {
      functions.createExecution(
        process.env.APPWRITE_EMAIL_FUNCTION_ID,
        JSON.stringify(created),
        false
      ).catch(() => {});
    }

    return new Response(
      JSON.stringify({ error: false, booking: created }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: true, message: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
