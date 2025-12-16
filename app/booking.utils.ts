export const getBookedTimeRanges = (rows: any[]) =>
  rows.map((b) => {
    const [h, m] = b.startTime.split(":").map(Number);
    const startMin = h * 60 + m;
    return { startMin, endMin: startMin + b.duration };
  });

export const isSlotAvailable = (
  startMin: number,
  duration: number,
  ranges: { startMin: number; endMin: number }[]
) => {
  const end = startMin + duration;
  return !ranges.some(r => !(end <= r.startMin || startMin >= r.endMin));
};

export function isDurationAllowed(startTime: string,
    duration: number,
    timeRanges: { startMin: number; endMin: number; }[]) {
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const end = startHours * 60 + startMinutes + duration;

    if (end > 1080) return false; // after 6 PM
    return timeRanges.every((r) => {
        // same overlap logic
        return end <= r.startMin || startHours * 60 + startMinutes >= r.endMin;
    });
}