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

export const getBookings = async (date: string) => {
  const response = await fetch(`/api/bookings?date=${encodeURIComponent(date)}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export const createBooking = async (booking: BookingPayload) => {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};