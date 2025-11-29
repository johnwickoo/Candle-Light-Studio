import { Client, ID, Query, TablesDB, Functions} from "appwrite";


const PROJECT_ID=import.meta.env.VITE_APPWRITE_PROJECT_ID
const REGION=import.meta.env.VITE_APPWRITE_REGION
const DATABASE_ID=import.meta.env.VITE_APPWRITE_DATABASE_ID
const TABLE_ID=import.meta.env.VITE_TABLE_ID
const EMAIL_FUNCTION_ID = import.meta.env.VITE_EMAIL_FUNCTION_ID; // Your email function ID
 
console.log("Email Function ID:", EMAIL_FUNCTION_ID);
const client = new Client()
    .setEndpoint(`https://fra.cloud.appwrite.io/v1`)
    .setProject(PROJECT_ID);

const tablesDB = new TablesDB(client);
const functions = new Functions(client); // ✅ Add this line


export const createBooking = (booking: {
  id: `${string}-${string}-${string}-${string}-${string}`;
  name: string;
  email: string;
  phone: string;
  date: string;
  startTime: string;
  duration: number;
  service: string;
  notes: string;
}) => {
  return tablesDB.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      rowId: ID.unique(),
      data: booking,
  });
};



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
    const startMin = hours * 60 + minutes;
    const endMin = startMin + booking.duration;
    return { startMin, endMin };
  });
};

export const isSlotAvailable = (
startMin: number, duration: number, timeRanges: { startMin: number; endMin: number; }[]) => {
    
  const end = startMin + duration;
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
        if (end > 1080) return false;
        return end <= r.startMin || startHours * 60 + startMinutes >= r.endMin;
    });
}


// ✅ SIMPLER VERSION: Remove the method parameter (POST is default)
export const sendEmailConfirmation = async (bookingDetails: any) => {
    try {
        const execution = await functions.createExecution(
            EMAIL_FUNCTION_ID,
            JSON.stringify(bookingDetails), // body
            false // async execution
        );

        console.log("Email Function Success:", execution);
        
        // If you need to check the response
        if (execution.responseStatusCode === 200) {
            const response = JSON.parse(execution.responseBody);
            if (response.success) {
                console.log("Email sent:", response.message);
            }
        }
        
        return execution;
        
    } catch (error) {
        console.error("Email Function Failed:", error);
        throw error;
    }
};