import React from "react";
import Calendar from "../components/Calender";
import TimeSlots from "../components/Timeslots";
import BookingForm from "../components/BookingForm";
import Toast from "../components/toast";
import { databases } from "../lib/appwrite.server";
import { useLoaderData, type LoaderFunctionArgs, useNavigate, useSearchParams} from "react-router";
import { Query } from "node-appwrite";

type LoaderData = {
  bookings: any[];
  timeRanges: { startMin: number; endMin: number }[];
  markedDates: string[];
};


export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID!;
  const TB_ID = import.meta.env.VITE_APPWRITE_TABLE_ID!;
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
      markedDates
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

  return {
    bookings,
    timeRanges,
    markedDates
  } satisfies LoaderData;
}



export default function BookPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get("date");

  const { bookings, timeRanges, markedDates } = useLoaderData<LoaderData>();
  console.log("Bookings loaded:", bookings);

  const marked = markedDates;

  // const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [selectedStart, setSelectedStart] = React.useState<string | null>(null);
  const [duration, setDuration] = React.useState(60);
  const [showToast, setShowToast] = React.useState(false);
  const [reload, setReload] = React.useState(false);
  const [cache, setCache] = React.useState<Record<string, any>>({}); // New cache state
  
  


  return (
    <div className="mt-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      <div className="col-span-1">
        <Calendar selected={selectedDate} onSelect={(date) => {
    navigate(`?date=${date}`);}} markedDates={marked} reload={reload} />
      </div>

      <div className="col-span-1">
        <TimeSlots dateISO={selectedDate} selectedStart={selectedStart ?? undefined} onSelect={(s, dur)=>{ setSelectedStart(s); setDuration(dur); }} defaultDuration={duration} timeRanges={timeRanges} reload={reload}/>
      </div>

      <div className="col-span-1">
        <BookingForm selectedDate={selectedDate} selectedStart={selectedStart} selectedDuration={duration} onSuccess={()=>{
          setShowToast(true);
          setReload(true);
          setTimeout(() => {
            setShowToast(false);
            setReload(false);
          }, 5000);
        }} bookings={bookings} timeRanges={timeRanges} />
      </div>
    </div>
  );
}
