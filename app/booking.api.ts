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
const BOOKINGS_FUNCTION_ID = import.meta.env.VITE_BOOKINGS_FUNCTION_ID;
const BOOKINGS_FUNCTION_URL =
  `https://cloud.appwrite.io/v1/functions/${BOOKINGS_FUNCTION_ID}/executions`;

export const getBookings = async (date: string) => {
  const res = await fetch(
    `${BOOKINGS_FUNCTION_URL}?date=${encodeURIComponent(date)}`,
    { method: "GET" }
  );

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

