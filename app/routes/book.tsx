import React from "react";
import Calendar from "../components/Calender";
import TimeSlots from "../components/Timeslots";
import BookingForm from "../components/BookingForm";
import { databases } from "../lib/appwrite.server";
import { useLoaderData, type LoaderFunctionArgs, useNavigate, useSearchParams, redirect , type ActionFunctionArgs} from "react-router";
import { Query } from "node-appwrite";

type LoaderData = {
  bookings: any[];
  timeRanges: { startMin: number; endMin: number }[];
  markedDates: string[];
  howManyPercentOfDayBooked: number;
};
const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID!;
const TB_ID = import.meta.env.VITE_APPWRITE_TABLE_ID!;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID!; 
 
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const booking = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    duration: Number(formData.get("duration")),
    service: formData.get("service"),
    notes: formData.get("notes"),
  };

  if (!booking.date || !booking.startTime || !booking.email) {
    return { error: "Invalid booking data" };
  }

  const created = await databases.createDocument(
    DB_ID,
    COLLECTION_ID,
    "unique()",
    booking
  );

  return redirect(`?date=${booking.date}`);
}


export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID!;
  const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID!; 

  const allBookings = await databases.listDocuments(
    DB_ID,
    COLLECTION_ID,
    [
      Query.select(["date"]),
      Query.limit(5000)
    ]
  );
   const markedDates = Array.from(
    new Set(allBookings.documents.map((b: any) => b.date))
  );


  if (!date) {
    return {
      bookings: [],
      timeRanges: [],
      markedDates,
      howManyPercentOfDayBooked: 0
    } satisfies LoaderData;
  }

  const response = await databases.listDocuments(
    DB_ID,
    COLLECTION_ID,
    [Query.equal("date", date)]
  );

  const bookings = response.documents;

  const timeRanges = bookings.map((b: any) => {
    const [h, m] = b.startTime.split(":").map(Number);
    const startMin = h * 60 + m;
    return { startMin, endMin: startMin + b.duration };
  });
  const howManyPercentOfDayBooked = (timeRanges.reduce((acc, tr) => {
    return acc + (tr.endMin - tr.startMin);
  }, 0) / (9 * 60)) * 100;
  

  return {
    bookings,
    timeRanges,
    markedDates,
    howManyPercentOfDayBooked
  } satisfies LoaderData;
}



export default function BookPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get("date");

  const { bookings, timeRanges, markedDates } = useLoaderData<LoaderData>();
  
  const marked = markedDates;

  // const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [selectedStart, setSelectedStart] = React.useState<string | null>(null);
  const [duration, setDuration] = React.useState(60);

  
  


  return (
    <div className="mt-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      <div className="col-span-1">
        <Calendar selected={selectedDate} onSelect={(date) => {
    navigate(`?date=${date}`);}} markedDates={marked} />
      </div>

      <div className="col-span-1">
        <TimeSlots dateISO={selectedDate} selectedStart={selectedStart ?? undefined} onSelect={(s, dur)=>{ setSelectedStart(s); setDuration(dur); }} defaultDuration={duration} timeRanges={timeRanges}/>
      </div>

      <div className="col-span-1">
        <BookingForm selectedDate={selectedDate} selectedStart={selectedStart} selectedDuration={duration} timeRanges={timeRanges} />
      </div>
    </div>
  );
}
