import { Client, Databases, Query, Functions } from "node-appwrite";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const functions = new Functions(client);

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  if (!date) {
    return new Response(
      JSON.stringify({ error: true, message: "Date required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const response = await databases.listDocuments(
    process.env.APPWRITE_DATABASE_ID!,
    process.env.APPWRITE_TABLE_ID!,
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
}

export async function action({ request }: ActionFunctionArgs) {
  const { booking } = await request.json();

  const created = await databases.createDocument(
    process.env.APPWRITE_DATABASE_ID!,
    process.env.APPWRITE_TABLE_ID!,
    "unique()",
    booking
  );

  if (process.env.APPWRITE_EMAIL_FUNCTION_ID) {
    functions.createExecution(
      process.env.APPWRITE_EMAIL_FUNCTION_ID,
      JSON.stringify(created),
      false
    );
  }

  return new Response(
    JSON.stringify({ error: false, booking: created }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
}
