// bookingsStore.ts
export type Booking = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  date: string;           // YYYY-MM-DD
  start: string;          // "09:00"
  duration: number;       // minutes (30, 60, 120)
  service?: string;
  notes?: string;
  createdAt: string;
};

const KEY = "studio_bookings_v1";

export const loadBookings = (): Booking[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveBookings = (items: Booking[]) => {
  localStorage.setItem(KEY, JSON.stringify(items));
};

export const addBooking = (b: Booking) => {
  const list = loadBookings();
  list.push(b);
  saveBookings(list);
};

export const getBookingsForDate = (date: string) =>
  loadBookings().filter((b) => b.date === date);

// returns array of {start, end} in minutes for booked slots on date
export const getBookedRangesForDate = (date: string) => {
  const bs = getBookingsForDate(date);
  return bs.map((b) => {
    const [h, m] = b.start.split(":").map(Number);
    const startMin = h * 60 + m;
    return { startMin, endMin: startMin + b.duration };
  });
};

// check overlap: returns true if [startMin, startMin+duration) overlaps existing
export const isSlotAvailable = (
  date: string,
  startMin: number,
  duration: number
) => {
  const ranges = getBookedRangesForDate(date);
  const end = startMin + duration;
  return !ranges.some((r) => !(end <= r.startMin || startMin >= r.endMin));
};
