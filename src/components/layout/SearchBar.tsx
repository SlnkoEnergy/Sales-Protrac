"use client";

import { useDateFilter } from "@/modules/dashboard/components/DateFilterContext";
import { DateRange } from "react-date-range";
import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function SearchBar() {
  const {
    selectedFilter,
    setSelectedFilter,
    filters,
    dateRange,
    setDateRange,
    showPicker,
    setShowPicker,
  } = useDateFilter();

  const pickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  const formattedDateRange = `${format(
    dateRange[0].startDate,
    "MMM d, yyyy"
  )} - ${format(dateRange[0].endDate, "MMM d, yyyy")}`;

  const navigate = useNavigate();

  return (
    <div className="bg-[#e5e5e5] w-full px-4 py-3 flex justify-between items-center shadow-sm relative z-30">
      <div className="flex items-center  px-4 py-2 w-1/3 min-w-[200px] ">
        
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-800 font-medium relative">
        <div className="flex items-center gap-1 cursor-pointer group relative">
          <span>
            {selectedFilter === "Custom" ? formattedDateRange : selectedFilter}
          </span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>

          <div className="absolute top-full right-0 mt-1 z-50 bg-white border border-gray-200 rounded shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            {filters.map((f) => (
              <div
                key={f.label}
                onClick={() => {
                  setSelectedFilter(f.label);
                  setShowPicker(f.label === "Custom");
                }}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 whitespace-nowrap ${
                  selectedFilter === f.label
                    ? "font-semibold text-blue-600"
                    : ""
                }`}
              >
                {f.label}
              </div>
            ))}
          </div>
        </div>

        <span
          className="cursor-pointer text-black hover:underline"
          onClick={() => navigate("/addLead")}
        >
          + Add Lead
        </span>
        <span
          className="cursor-pointer text-black hover:underline"
          onClick={() => navigate("/addtask")}
        >
          + Add Task
        </span>
      </div>

      {selectedFilter === "Custom" && showPicker && (
        <div
          ref={pickerRef}
          className="absolute top-full right-10 mt-2 z-50 shadow-lg"
        >
          <DateRange
            editableDateInputs
            onChange={(item) => setDateRange([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={dateRange}
            maxDate={new Date()}
          />
        </div>
      )}
    </div>
  );
}
