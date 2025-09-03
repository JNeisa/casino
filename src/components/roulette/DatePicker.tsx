import React, { useState } from "react";

type DateOrRange = Date | { start: Date; end: Date };

interface DatePickerProps {
  value: DateOrRange;
  onChange: (value: DateOrRange) => void;
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const [mode, setMode] = useState<"single" | "range">(
    value instanceof Date ? "single" : "range"
  );

  const formatDateForInput = (date: Date): string =>
    date.toISOString().split("T")[0];

  const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(`${e.target.value}T00:00:00`);
    onChange(newDate);
  };

  const handleRangeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    which: "start" | "end"
  ) => {
    let current: { start: Date; end: Date };
    if (typeof value === "object" && "start" in value && "end" in value) {
      current = value;
    } else {
      const today = new Date();
      current = { start: today, end: today };
    }
    const newDate = new Date(`${e.target.value}T00:00:00`);
    let updated: { start: Date; end: Date };
    if (which === "start") {
      updated = { start: newDate, end: current.end < newDate ? newDate : current.end };
    } else {
      updated = { start: current.start > newDate ? newDate : current.start, end: newDate };
    }
    console.log('Updated range:', updated);
    onChange(updated);
  };

  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3 sm:mb-4 text-center">
        Ver Datos por Día o Rango
      </h2>
      <div className="flex justify-center mb-4">
        <label className="mr-6 flex items-center">
          <input
            type="radio"
            checked={mode === "single"}
            onChange={() => {
              setMode("single");
              if (!(value instanceof Date)) {
                onChange(new Date());
              }
            }}
            className="mr-2"
          />
          Fecha única
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            checked={mode === "range"}
            onChange={() => {
              setMode("range");
              if (value instanceof Date) {
                onChange({
                  start: value,
                  end: value,
                });
              }
            }}
            className="mr-2"
          />
          Rango de fechas
        </label>
      </div>
      {mode === "single" ? (
        <div className="flex justify-center">
          <input
            type="date"
            value={value instanceof Date ? formatDateForInput(value) : ""}
            onChange={handleSingleChange}
            className="p-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <input
            type="date"
            value={
              typeof value === "object" && "start" in value
                ? formatDateForInput(value.start)
                : ""
            }
            onChange={(e) => handleRangeChange(e, "start")}
            className="p-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          <span className="mx-2 text-gray-600">a</span>
          <input
            type="date"
            value={
              typeof value === "object" && "end" in value
                ? formatDateForInput(value.end)
                : ""
            }
            onChange={(e) => handleRangeChange(e, "end")}
            className="p-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>
      )}
    </div>
  );
}