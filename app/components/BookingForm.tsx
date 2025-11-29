import React from "react";
import { createBooking } from "../Appwrite"
import { isDurationAllowed,sendEmailConfirmation } from "../Appwrite";
import Toast from "./toast";


type Props = {
  selectedDate: string | null;
  selectedStart: string | null;
  selectedDuration: number;
  bookings: any[];
  timeRanges: Array<{ startMin: number; endMin: number }>;
  onSuccess?: () => void;
};

export default function BookingForm({ selectedDate, selectedStart, selectedDuration, onSuccess, timeRanges, bookings }: Props) {
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", service: "Portrait", notes: "" });
  const [duration, setDuration] = React.useState<number>(selectedDuration || 60);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showToast, setShowToast] = React.useState(false);

 
  React.useEffect(() => {
    setDuration(selectedDuration);
  }, [selectedDuration]);

  const submit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  if (!selectedDate || !selectedStart) {
    setError("Please select a date and time slot.");
    return;
  }

  if (!form.name || !form.email) {
    setError("Name & email required.");
    return;
  }
  
  setLoading(true);

  const booking = {
    id: crypto.randomUUID(),
    name: form.name,
    email: form.email,
    phone: form.phone,
    date: selectedDate,
    startTime: selectedStart,
    duration,
    service: form.service,
    notes: form.notes,
  };

  try {
    const newBookingDoc = await createBooking(booking);
    sendEmailConfirmation({
          name: form.name,
          email: form.email,
          date: selectedDate,
          startTime: selectedStart,
          duration: duration,
          service: form.service,
      });

    localStorage.setItem("lastSelectedDate", selectedDate);
   

    // reset form
    setForm({
      name: "",
      email: "",
      phone: "",
      service: "Portrait",
      notes: "",
    });

    // alert("Booking confirmed!");
    

    // Only reload AFTER async write finished
   
    
    if (onSuccess) onSuccess();
   

    

  } catch (err) {
    console.error(err);
    setError("Failed to submit booking.");
  } finally {
    setLoading(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  }
};


  return (
    <div className="bg-white rounded-2xl shadow p-4 w-full">

      {showToast && <Toast message="Booking successful! Confirmation email is being sent." />}

      <h3 className="font-semibold mb-3">Confirm booking</h3>
      <form onSubmit={submit} className="space-y-3">
        <div className="text-sm text-gray-600">Date: <strong>{selectedDate || "—"}</strong></div>
        <div className="text-sm text-gray-600">Time: <strong>{selectedStart || "—"}</strong></div>

        <label className="block">
          <input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} placeholder="Full name" className="w-full p-2 border rounded" />
        </label>

        <label className="block">
          <input type="email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} placeholder="Email" className="w-full p-2 border rounded" />
        </label>

        <label className="block">
          <input value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} placeholder="Phone" className="w-full p-2 border rounded" />
        </label>

        <label className="block text-sm">
          Duration
          <select value={duration} onChange={(e)=>setDuration(Number(e.target.value))} className="w-full p-2 border rounded mt-1">
            <option value={60} disabled={!isDurationAllowed(selectedStart || "", 60, timeRanges)}>1 hour</option>
            <option value={120} disabled={!isDurationAllowed(selectedStart || "", 120, timeRanges)}>2 hours</option>
          </select>
        </label>

        <label>
          <textarea value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})} placeholder="Notes" className="w-full p-2 border rounded" rows={3} />
        </label>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button type="submit" disabled={loading} className="w-full bg-black text-white py-2 rounded">
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
}
