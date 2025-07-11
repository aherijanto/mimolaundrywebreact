'use client';
import React, { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  fcmid: string; // Firebase Cloud Messaging ID
  // Add other fields as needed
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/fcm");
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users || []);
        } else {
          setError(data.error || "Failed to fetch users");
        }
      } catch (err) {
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex items-center justify-between px-8 py-6">
        <h1 className="text-3xl font-bold text-blue-600">Users</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition-colors">
          Add User
        </button>
      </div>
      <div className="flex-1 px-8">
        {loading ? (
          <div className="text-center text-gray-500">Loading users...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <table className="min-w-full bg-white rounded shadow-md text-green-900">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b text-green-900">ID</th>
                <th className="px-4 py-2 border-b text-green-900">Name</th>
                <th className="px-4 py-2 border-b text-green-900">Email</th>
                <th className="px-4 py-2 border-b text-green-900">FCM</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2 border-b text-center text-green-900">{user.id}</td>
                  <td className="px-4 py-2 border-b text-green-900">{user.name}</td>
                  <td className="px-4 py-2 border-b text-green-900">{user.email}</td>
                  <td className="px-4 py-2 border-b text-green-900 break-all whitespace-pre-line max-w-xs">
                    {user.fcmid}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
