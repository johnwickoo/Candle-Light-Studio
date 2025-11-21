import { Client, ID, TablesDB } from "appwrite";

const PROJECT_ID=import.meta.env.VITE_APPWRITE_PROJECT_ID
const REGION=import.meta.env.VITE_APPWRITE_REGION
const DATABASE_ID=import.meta.env.VITE_APPWRITE_DATABASE_ID
const TABLE_ID=import.meta.env.VITE_TABLE_ID   

const client = new Client()
    .setEndpoint(`https://fra.cloud.appwrite.io/v1`)
    .setProject(PROJECT_ID);

const tablesDB = new TablesDB(client);


export const getSlots=(booking: { id: `${string}-${string}-${string}-${string}-${string}`; name: string; email: string; phone: string; date: string; startTime: string; duration: number; service: string; notes: string;})=>{
    
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

