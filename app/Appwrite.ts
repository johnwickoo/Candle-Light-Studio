import { Client, ID, Query, TablesDB } from "appwrite";


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
console.log("Fetched bookings:", bookings);

return {
    bookings,
    timeRanges
  };
}

export const getBookedTimeRanges = (rows: any[]) => {
  return rows.map((booking) => {
    const [hours, minutes] = booking.startTime.split(":").map(Number);
    const startMin = hours * 60 + minutes;
    const endMin = startMin + booking.duration;
    return { startMin, endMin };
  });
};

export const isSlotAvailable = (
startMin: number, duration: number, timeRanges: { startMin: number; endMin: number; }[]) => {
    
  const end = startMin + duration;
console.log("Checking slot:", startMin, duration, end, timeRanges);
  return !timeRanges.some((r) => {
    // Overlap check
    return !(end <= r.startMin || startMin >= r.endMin);
  })
};

export function isDurationAllowed(startTime: string,
    duration: number,
    timeRanges: { startMin: number; endMin: number; }[]) {
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const end = startHours * 60 + startMinutes + duration;

    return timeRanges.every((r) => {
        // same overlap logic
        return end <= r.startMin || startHours * 60 + startMinutes >= r.endMin;
    });
}
