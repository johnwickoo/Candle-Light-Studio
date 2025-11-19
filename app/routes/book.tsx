import React from "react";
import Calendar from "../components/Calender";
import TimeSlots from "../components/Timeslots";
import BookingForm from "../components/BookingForm";
import { getBookingsForDate } from "../utils/bookingsStore";

export default function BookPage() {
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [selectedStart, setSelectedStart] = React.useState<string | null>(null);
  const [duration, setDuration] = React.useState(60);
  const [marked, setMarked] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (selectedDate) {
      // refresh bookings — simple approach: mark dates that have bookings
      const bk = getBookingsForDate(selectedDate);
      setMarked(bk.map(b => b.date)); // simple — you can mark differently
    }
  }, [selectedDate]);

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      <div className="col-span-1">
        <Calendar selected={selectedDate} onSelect={(d)=>{ setSelectedDate(d); setSelectedStart(null); }} markedDates={marked} />
      </div>

      <div className="col-span-1">
        <TimeSlots dateISO={selectedDate} selectedStart={selectedStart ?? undefined} onSelect={(s, dur)=>{ setSelectedStart(s); setDuration(dur); }} defaultDuration={duration} />
      </div>

      <div className="col-span-1">
        <BookingForm selectedDate={selectedDate} selectedStart={selectedStart} selectedDuration={duration} onSuccess={()=>{
          // after success you can refresh state or show modal
        }} />
      </div>
    </div>
  );
}
