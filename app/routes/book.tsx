import React from "react";
import Calendar from "../components/Calender";
import TimeSlots from "../components/Timeslots";
import BookingForm from "../components/BookingForm";
import { getBookingsForDate } from "../utils/bookingsStore";
import { getBookings } from "../Appwrite";
import Toast from "../components/toast";


export default function BookPage() {
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [selectedStart, setSelectedStart] = React.useState<string | null>(null);
  const [duration, setDuration] = React.useState(60);
  const [marked, setMarked] = React.useState<string[]>([]);
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [timeRanges, setTimeRanges] = React.useState<{ startMin: number; endMin: number }[]>([]); 
  const [showToast, setShowToast] = React.useState(false);
  const [reload, setReload] = React.useState(false);
  const [cache, setCache] = React.useState<Record<string, any>>({}); // New cache state
  

  React.useEffect(() => {
  const saved = localStorage.getItem("lastSelectedDate");
  if (saved) {
    setSelectedDate(saved);
    console.log("Restored date from localStorage:", saved);
    
  }
}, [reload]);

//   React.useEffect(() => {
//   if (selectedDate) {
//     console.log("selectedDate UPDATED:", selectedDate);
//   }
// }, [selectedDate]);


 React.useEffect(() => {
    if (!selectedDate) return;

    (async () => {
      if (reload) {
          console.log("Forcing fresh data fetch due to RELOAD event:", selectedDate);
      } else if (cache[selectedDate]) { 
          console.log("Using cached data for:", selectedDate);
          const bk = cache[selectedDate];
          setBookings(bk.bookings);
          setTimeRanges(bk.timeRanges);
          setMarked(bk.bookings.map((b: any) => b.date));
          return; // Exit here if cached
      }

      // 3. FETCH DATA (Runs if reload is true OR if date is not in cache)
      console.log("Fetching new data from database for:", selectedDate);
      const bk = await getBookings(selectedDate);
      
      // 4. UPDATE STATE AND CACHE
      setBookings(bk.bookings);
      setCache((prev) => ({ ...prev, [selectedDate]: bk })); // Cache the result
      setTimeRanges(bk.timeRanges);
      setMarked(bk.bookings.map((b: any) => b.date));
      
    })();
  }, [selectedDate, reload]);
  
  return (
    <div className="mt-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      <div className="col-span-1">
        <Calendar selected={selectedDate} onSelect={(d)=>{ setSelectedDate(d); setSelectedStart(null); }} markedDates={marked} reload={reload} />
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
