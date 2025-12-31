import { Client, Databases, Functions } from "node-appwrite";

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const apiKey = import.meta.env.VITE_APPWRITE_API_KEY;

if (!endpoint || !projectId || !apiKey) {
  throw new Error("❌ Missing Appwrite server environment variables");
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

export const databases = new Databases(client);
export const functions = new Functions(client);
