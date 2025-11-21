import { Client, ID, Query, TablesDB } from "appwrite";
import BookingForm from "./components/BookingForm";

const PROJECT_ID=import.meta.env.VITE_APPWRITE_PROJECT_ID
const REGION=import.meta.env.VITE_APPWRITE_REGION
const DATABASE_ID=import.meta.env.VITE_APPWRITE_DATABASE_ID
const TABLE_ID=import.meta.env.VITE_TABLE_ID   

const client = new Client()
    .setEndpoint(`https://fra.cloud.appwrite.io/v1`)
    .setProject(PROJECT_ID);

const tablesDB = new TablesDB(client);


export const createBooking=(booking: { id: `${string}-${string}-${string}-${string}-${string}`; name: string; email: string; phone: string; date: string; startTime: string; duration: number; service: string; notes: string;})=>{
    
    const promise = tablesDB.createRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    rowId: ID.unique(),
    data: booking
});

promise.then(function (response) {
    console.log(response,booking);
}, function (error) {
    console.log(error);
});

}


export const getBookings = async (selectedDate: string) => {
const res = await tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    queries: [
        Query.equal('date', selectedDate  // store "YYYY-MM-DD"
),    
    ]
});

return res.rows;
}