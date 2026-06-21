import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getTimetableEntries, getTimetableStatus } from "../../api/timetable";

export const TimetableGrid = () => {
  const { id } = useParams<{ id: string }>();
  const [entries, setEntries] = useState<any[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [entriesRes, statusRes] = await Promise.all([
        getTimetableEntries(id!),
        getTimetableStatus(id!)
      ]);
      if (entriesRes.success) setEntries(entriesRes.data);
      if (statusRes.success) setStatus(statusRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading timetable...</div>;
  if (!status) return <div className="p-6">Timetable not found.</div>;

  // Group entries by day, then by timeSlot
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  // Get unique timeslots from entries
  const timeSlots = Array.from(new Set(entries.map(e => `${e.timeSlot.startTime}-${e.timeSlot.endTime}`))).sort();

  const getEntry = (day: string, slot: string) => {
    return entries.filter(e => 
      e.timeSlot.dayOfWeek === day && 
      `${e.timeSlot.startTime}-${e.timeSlot.endTime}` === slot
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-auto">
      <h2 className="text-2xl font-bold mb-2 dark:text-white">Timetable: {status.name}</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Status: {status.status.toUpperCase()}</p>

      {status.status === "completed" ? (
        <div className="min-w-max">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-center w-32 dark:text-white">Time \ Day</th>
                {daysOfWeek.map(day => (
                  <th key={day} className="border border-gray-300 dark:border-gray-600 p-2 text-center dark:text-white w-48">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(slot => (
                <tr key={slot}>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center font-semibold bg-gray-50 dark:bg-gray-700 dark:text-gray-200">
                    {slot}
                  </td>
                  {daysOfWeek.map(day => {
                    const cellEntries = getEntry(day, slot);
                    return (
                      <td key={`${day}-${slot}`} className="border border-gray-300 dark:border-gray-600 p-2 align-top">
                        {cellEntries.length > 0 ? (
                          <div className="space-y-2">
                            {cellEntries.map(entry => (
                              <div key={entry._id} className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800 text-sm">
                                <div className="font-bold text-blue-800 dark:text-blue-300">{entry.course.name}</div>
                                <div className="text-gray-600 dark:text-gray-400 text-xs">Faculty: {entry.faculty.name}</div>
                                <div className="text-gray-600 dark:text-gray-400 text-xs">Room: {entry.room.name}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-gray-400 text-sm italic">- Free -</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-red-500">Cannot display grid. Timetable generation failed or is still pending.</div>
      )}
    </div>
  );
};
