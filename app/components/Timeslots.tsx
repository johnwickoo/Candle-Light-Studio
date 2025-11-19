import React from "react";
import { isSlotAvailable } from "../utils/bookingsStore";

type Props = {
  dateISO: string | null;
  onSelect: (start: string, duration: number) => void;
  selectedStart?: string;
  defaultDuration?: number;
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function TimeSlots({ dateISO, onSelect, selectedStart, defaultDuration = 60 }: Props) {
  // studio working hours
  const startHour = 9, endHour = 18;
  const durations = [30, 60, 120]; // available durations

  const generateSlots = () => {
    const out: string[] = [];
    for (let h = startHour; h < endHour; h++) {
      [0].forEach(min => out.push(`${pad(h)}:${pad(min)}`));
    }
    return out;
  };

  if (!dateISO) {
    return <div className="bg-white rounded-2xl shadow p-4">Pick a date</div>;
  }

  const slots = generateSlots();

  return (
    <div className="bg-white rounded-2xl shadow p-4 w-full">
      <h3 className="font-semibold mb-3">Available slots — {dateISO}</h3>
      <div className="grid grid-cols-3 gap-2">
        {slots.map((s) => {
          const [h,m] = s.split(":").map(Number);
          const startMin = h * 60 + m;
          const available = isSlotAvailable(dateISO, startMin, defaultDuration);
          const active = selectedStart === s;
          return (
            <button
              key={s}
              onClick={() => available && onSelect(s, defaultDuration)}
              disabled={!available}
              className={`py-2 px-3 text-sm rounded ${available ? (active ? "bg-black text-white" : "bg-white hover:bg-gray-100") : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
            >
              {s}
            </button>
          );
        })}
      </div>
      {/* quick duration chooser */}
      <div className="mt-3 text-xs text-gray-500">Default duration: {defaultDuration} mins (change in form)</div>
    </div>
  );
}
