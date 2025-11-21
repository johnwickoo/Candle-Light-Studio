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
        Query.equal('date', selectedDate),    
    ]
});
const bookings = res.rows || [];
const timeRanges = getBookedTimeRanges(bookings);

return {
    bookings,
    timeRanges
  };
}

export const getBookedTimeRanges = (rows: any[]) => {
    return rows.map((booking) => {
        const [hours, minutes] = booking.startTime.split(":").map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + booking.duration;
        // console.log(rows);
         return { startMin: startMinutes, endMin: endMinutes };
    });
}

export const isSlotAvailable = async (
  date: string,
  startMin: number,
  duration: number
) => {
  const { timeRanges } = await getBookings(date);
  const end = startMin + duration;
 return !timeRanges.some((r) => {
    return !(end <= r.startMin || startMin >= r.endMin);
  });


}