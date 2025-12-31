import React from "react";
import { Form, useNavigation, useActionData } from "react-router";
import { isDurationAllowed } from "../booking.utils";
import Toast from "./toast";

type Props = {
  selectedDate: string | null;
  selectedStart: string | null;
  selectedDuration: number;
  timeRanges: Array<{ startMin: number; endMin: number }>;
};

export default function BookingForm({
  selectedDate,
  selectedStart,
  selectedDuration,
  timeRanges
}: Props) {
  const navigation = useNavigation();
  const actionData = useActionData<{ error?: string; success?: boolean }>();

  const loading = navigation.state === "submitting";

  const [duration, setDuration] = React.useState(selectedDuration || 60);

  React.useEffect(() => {
    setDuration(selectedDuration);
  }, [selectedDuration, selectedDate]);

  return (
    <div className="bg-white rounded-2xl shadow p-4 w-full">
      {actionData?.success && (
        <Toast message="Booking successful! Confirmation email is being sent." />
      )}

      <h3 className="font-semibold mb-3">Confirm booking</h3>

      <Form method="post" className="space-y-3">
        {/* REQUIRED SERVER FIELDS */}
        <input type="hidden" name="date" value={selectedDate ?? ""} />
        <input type="hidden" name="startTime" value={selectedStart ?? ""} />
        <input type="hidden" name="duration" value={duration} />
      
        <div className="text-sm text-gray-600">
          Date: <strong>{selectedDate || "—"}</strong>
        </div>

        <div className="text-sm text-gray-600">
          Time: <strong>{selectedStart || "—"}</strong>
        </div>

        <label className="block">
          <input
            name="name"
            placeholder="Full name"
            required
            className="w-full p-2 border rounded"
          />
        </label>

        <label className="block">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full p-2 border rounded"
          />
        </label>

        <label className="block">
          <input
            name="phone"
            placeholder="Phone"
            className="w-full p-2 border rounded"
          />
        </label>
      <select name="service" required>
        <option value="Portrait">Portrait</option>
        <option value="Event">Event</option>
        <option value="Product">Product</option>
      </select>
      
        <label className="block text-sm">
          Duration
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full p-2 border rounded mt-1"
          >
            <option
              value={60}
              disabled={!isDurationAllowed(selectedStart || "", 60, timeRanges)}
            >
              1 hour
            </option>
            <option
              value={120}
              disabled={!isDurationAllowed(selectedStart || "", 120, timeRanges)}
            >
              2 hours
            </option>
            <option
              value={180}
              disabled={!isDurationAllowed(selectedStart || "", 180, timeRanges)}
            >
              3 hours
            </option>
            <option
              value={240}
              disabled={!isDurationAllowed(selectedStart || "", 240, timeRanges)}
            >
              4 hours
            </option>
            <option
              value={300}
              disabled={!isDurationAllowed(selectedStart || "", 300, timeRanges)}
            >
              5 hours
            </option>
            <option
              value={360}
              disabled={!isDurationAllowed(selectedStart || "", 360, timeRanges)}
            >
              6 hours
            </option>
          </select>
        </label>

        <label>
          <textarea
            name="notes"
            placeholder="Notes"
            className="w-full p-2 border rounded"
            rows={3}
          />
        </label>

        {actionData?.error && (
          <div className="text-red-600 text-sm">{actionData.error}</div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedDate || !selectedStart}
          className="w-full bg-black text-white py-2 rounded"
        >
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </Form>
    </div>
  );
}
