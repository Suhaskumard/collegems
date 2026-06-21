import React from "react";
export default function TimetableGrid() {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  const slots = [
    "9:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 1:00",
    "2:00 - 3:00",
  ];

  return (
    
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="grid grid-cols-6 min-w-[900px]">
        
        {/* Header Row */}
        <div className="border-b border-r border-gray-200 dark:border-gray-700 p-4 font-semibold text-gray-700 dark:text-gray-300">
          Time
        </div>

        {days.map((day) => (
          <div
            key={day}
            className="border-b border-r border-gray-200 dark:border-gray-700 p-4 text-center font-semibold text-gray-700 dark:text-gray-300"
          >
            {day}
          </div>
        ))}

        {/* Timetable Rows */}
        {slots.map((slot) => (
          <React.Fragment key={slot}>
            {/* Time Column */}
            <div className="border-b border-r border-gray-200 dark:border-gray-700 p-4 font-medium text-gray-600 dark:text-gray-400">
              {slot}
            </div>

            {/* Empty Cells */}
            {days.map((day) => (
              <div
                key={`${day}-${slot}`}
                className="border-b border-r border-gray-200 dark:border-gray-700 p-4 min-h-[100px]"
              >
                {/* Subject Card will go here later */}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}  