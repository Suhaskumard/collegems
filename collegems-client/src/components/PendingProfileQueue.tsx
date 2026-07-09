import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 1. Define the shape of the data expected from the backend
interface PendingUser {
  _id: string;
  name: string;
  email: string;
  role?: string;
  reminderCount: number;
  lastReminderSentAt?: string | null;
}

export default function PendingProfileQueue() {
  // 2. Tell TypeScript this state holds an array of PendingUser objects
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reminders/pending');
      setPendingUsers(response.data.data);
    } catch (error) {
      console.error("Failed to fetch pending users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleSendReminders = async () => {
    try {
      setSending(true);
      // user._id is now properly typed as a string
      const userIds = pendingUsers.map(user => user._id);
      
      await axios.post('/api/reminders/send', { userIds });
      
      alert(`Reminders queued for ${userIds.length} users!`);
      fetchPendingUsers();
    } catch (error) {
      console.error("Failed to send reminders", error);
      alert("Failed to send reminders.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Loading pending profiles...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Incomplete Profiles</h2>
        <button
          onClick={handleSendReminders}
          disabled={pendingUsers.length === 0 || sending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {sending ? "Queueing Reminders..." : `Send Reminders (${pendingUsers.length})`}
        </button>
      </div>

      {pendingUsers.length === 0 ? (
        <p className="text-green-600 font-medium">All users have completed their profiles!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Total Reminders Sent</th>
                <th className="p-3">Last Reminder</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{user.name}</td>
                  <td className="p-3 text-gray-600">{user.email}</td>
                  <td className="p-3 text-gray-600 capitalize">{user.role || 'User'}</td>
                  <td className="p-3">
                    <span className="bg-amber-100 text-amber-800 py-1 px-2 rounded-full text-xs font-bold">
                      {user.reminderCount}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">
                    {user.lastReminderSentAt 
                      ? new Date(user.lastReminderSentAt).toLocaleDateString() 
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}