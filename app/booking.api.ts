type BookingPayload = {
  name: string;
  email: string;
  phone: string;
  date: string;
  startTime: string;
  duration: number;
  service: string;
  notes?: string;
};
const BOOKINGS_FUNCTION_URL = import.meta.env.VITE_BOOKINGS_FUNCTION_URL;

export const getBookings = async (date: string) => {
   console.log(`Fetching bookings for date: ${date}`);
  const res = await fetch(`/api/bookings?date=${encodeURIComponent(date)}`);
  console.log(`Response status: ${res.status}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message);
  }

  return res.json();
};


export const createBooking = async (booking: BookingPayload) => {
  const res = await fetch(BOOKINGS_FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ booking }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message);
  }

  return res.json();
};

