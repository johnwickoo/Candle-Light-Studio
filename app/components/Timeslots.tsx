import React, { useEffect, useState } from "react";
import { isSlotAvailable } from "../Appwrite";

type Props = {
  dateISO: string | null;
  onSelect: (start: string, duration: number) => void;
  selectedStart?: string;
  defaultDuration?: number;
  timeRanges: { startMin: number; endMin: number }[];
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function TimeSlots({
  dateISO,
  onSelect,
  selectedStart,
  defaultDuration = 60,
  timeRanges,
}: Props) {

  const startHour = 9,
    endHour = 18;

  const generateSlots = () => {
    const out: string[] = [];
    for (let h = startHour; h < endHour; h++) {
      [0].forEach((min) => out.push(`${pad(h)}:${pad(min)}`));
    }
    return out;
  };

  const slots = generateSlots();
  const [availability, setAvailability] = useState<{ [key: string]: boolean }>({});

  // Load availability when date changes
  useEffect(() => {
    console.log()
    if (!dateISO) return;

    const load = async () => {
      const out: any = {};
      for (const s of slots) {
        const [h, m] = s.split(":").map(Number);
        const startMin = h * 60 + m;
        out[s] = isSlotAvailable(startMin, defaultDuration, timeRanges);
        
      }
      setAvailability(out);
      

    };

    load();
  }, [dateISO, defaultDuration, timeRanges]); // reload if date or duration changes

  if (!dateISO) {
    return <div className="bg-white rounded-2xl shadow p-4">Pick a date</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4 w-full">
      <h3 className="font-semibold mb-3">Available slots — {dateISO}</h3>

      <div className="grid grid-cols-3 gap-2">
        {slots.map((s) => {
          const available = availability[s];
          const active = selectedStart === s;

          return (
            <button
              key={s}
              onClick={() => available && onSelect(s, defaultDuration)}
              disabled={available === false}
              className={`py-2 px-3 text-sm rounded ${
                available === undefined
                  ? "bg-gray-100 text-gray-400" // still loading
                  : available
                  ? active
                    ? "bg-black text-white"
                    : "bg-white hover:bg-gray-100"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Default duration: {defaultDuration} mins (change in form)
      </div>
    </div>
  );
}
