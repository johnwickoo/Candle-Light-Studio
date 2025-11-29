import React, { useEffect } from "react";

type Props = {
  selected: string | null; // "YYYY-MM-DD"
  onSelect: (dateISO: string) => void;
  markedDates?: string[]; // array of YYYY-MM-DD (booked)
  reload?: boolean;
};

const weekDays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function formatDate(date: Date) {
  return date.toLocaleDateString("en-CA"); // gives YYYY-MM-DD safely
}


export default function Calendar({ selected, onSelect, markedDates = [], reload }: Props) {
  const [cursor, setCursor] = React.useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });


  // Sync calendar month with selected date
useEffect(() => {
  if (selected) {
    const d = new Date(selected);
    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
    setTimeout(() => {
      localStorage.removeItem("lastSelectedDate");
    }, 500);
  }
}, [selected, reload]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
 
  
  const currentDate = new Date();
  
  const firstDayWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prev = () => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  const next = () => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  

  
  return (
    <div className="bg-white rounded-2xl shadow p-4 w-full">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} disabled={month < currentDate.getMonth()+1 && year <= currentDate.getFullYear()} className="px-2 py-1 rounded hover:bg-gray-100">{'‹'}</button>
        <div className="font-semibold">{cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}</div>
        <button onClick={next} className="px-2 py-1 rounded hover:bg-gray-100">{'›'}</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
        {weekDays.map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={idx} className="h-10"/>;
          const date = new Date(year, month, day);
          const iso = formatDate(date);
          const isSelected = selected === iso && date.getMonth() === month;
          const isMarked = markedDates.includes(iso);
          const isDisabled = day < currentDate.getDate() && month <= currentDate.getMonth() && year <= currentDate.getFullYear();
          return (
            <button
              key={idx}
              onClick={() => onSelect(iso)}
              className={`h-10 rounded-md flex items-center justify-center text-sm
                ${isSelected ? "bg-black text-white" : "hover:bg-gray-100"}
                ${isMarked ? "ring-2 ring-red-300" : ""}
                ${isDisabled ? "cursor-not-allowed text-gray-200" : ""}
              `}
              disabled={isDisabled}
              
              
            >
              <span>{day}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
