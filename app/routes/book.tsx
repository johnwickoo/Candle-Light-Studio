import React from "react";
import Calendar from "../components/Calender";
import TimeSlots from "../components/Timeslots";
import BookingForm from "../components/BookingForm";
import { getBookingsForDate } from "../utils/bookingsStore";
import { getBookings } from "../Appwrite";


export default function BookPage() {
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [selectedStart, setSelectedStart] = React.useState<string | null>(null);
  const [duration, setDuration] = React.useState(60);
  const [marked, setMarked] = React.useState<string[]>([]);
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [timeRanges, setTimeRanges] = React.useState<{ startMin: number; endMin: number }[]>([]); 
 
  

  React.useEffect(() => {
    if (!selectedDate) return;
      // refresh bookings — simple approach: mark dates that have bookings
    (async () => {
      const bk = await getBookings(selectedDate);
      setBookings(bk.bookings);
      setTimeRanges(bk.timeRanges);
      setMarked(bk.bookings.map((b: any) => b.date)); //mark differently
    })();
  }, [selectedDate]);
  
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      <div className="col-span-1">
        <Calendar selected={selectedDate} onSelect={(d)=>{ setSelectedDate(d); setSelectedStart(null); }} markedDates={marked} />
      </div>

      <div className="col-span-1">
        <TimeSlots dateISO={selectedDate} selectedStart={selectedStart ?? undefined} onSelect={(s, dur)=>{ setSelectedStart(s); setDuration(dur); }} defaultDuration={duration} timeRanges={timeRanges} />
      </div>

      <div className="col-span-1">
        <BookingForm selectedDate={selectedDate} selectedStart={selectedStart} selectedDuration={duration} onSuccess={()=>{
          
        }} bookings={bookings} timeRanges={timeRanges} />
      </div>
    </div>
  );
}
