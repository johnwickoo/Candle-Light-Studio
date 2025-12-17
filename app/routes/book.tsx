import React from "react";
import Calendar from "../components/Calender";
import TimeSlots from "../components/Timeslots";
import BookingForm from "../components/BookingForm";
import { getBookings } from "../booking.api";
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


 React.useEffect(() => {
  if (!selectedDate) return;

  
  (async () => {
    // 1. Check Cache ONLY IF the trigger was NOT a 'reload'
    if (cache[selectedDate] && !reload) {
      console.log("Using cached data for:", selectedDate);
      const bk = cache[selectedDate];
      setBookings(bk.bookings);
      setTimeRanges(bk.timeRanges);
      setMarked(bk.bookings.map((b: any) => b.date));
      return; 
    }

    // 2. Fetch Fresh Data (because it's a new date OR a reload event)
    
    console.log(`Fetching new data for ${selectedDate}.`);
      // 3. Update State & Cache
      getBookings(selectedDate).then((data) => {
        console.log("Fetched bookings data:", data);
        console.log(data.bookings,data.timeRanges);

        console.log("About to set bookings with:", data.bookings);
      setBookings([...data.bookings]);
      setTimeRanges(data.timeRanges);
      setMarked(data.bookings.map((b: any) => b.date));
    });
    // const bk = await getBookings(selectedDate);
    
    // 3. Update State & Cache
    // setBookings(bk.bookings);
    // setTimeRanges(bk.timeRanges);
    // setMarked(bk.bookings.map((b: any) => b.date));

    // Update the cache after a successful fetch to ensure freshness
    setCache(prevCache => ({
      ...prevCache,
      [selectedDate]: { bookings, timeRanges}, // Store the fresh, full booking object
    }));
    
  })();
}, [selectedDate, reload]);
  
React.useEffect(() => {
  console.log("Bookings updated:", bookings);
  console.log("Fetching bookings for date:", selectedDate);

}, [bookings]);
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
