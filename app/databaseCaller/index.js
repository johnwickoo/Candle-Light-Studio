import { Client, ID, Query, TablesDB, Functions} from "appwrite";



const PROJECT_ID= process.env.PUBLIC_APPWRITE_PROJECT_ID;
const DATABASE_ID= process.env.PUBLIC_APPWRITE_DATABASE_ID;
const TABLE_ID= process.env.PUBLIC_APPWRITE_COLLECTION_ID;
const PROJECT_NAME= process.env.PUBLIC_APPWRITE_PROJECT_NAME;

const client = new Client()
    .setEndpoint(`https://fra.cloud.appwrite.io/v1`)
    .setProject(PROJECT_ID);

const tablesDB = new TablesDB(client);
const functions = new Functions(client); 

export default async ({ req, res }) => {
    const bookings = JSON.parse(req.body)
    

    if (body.action === "list") {
    return listBookings(body.date, res);
  }

  if (body.action === "create") {
    return createBooking(body.booking, res);
  }

  return res.json({ error: "Invalid action" }, 400);
  

}
