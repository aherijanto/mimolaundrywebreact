'use client';
import React, { useEffect, useState } from 'react';

export default function FcmMessagingPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedFcmId, setSelectedFcmId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/fcm')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch users');
        setLoading(false);
      });
  }, []);

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const email = e.target.value;
    setSelectedUser(email);
    const user = users.find((u) => u.email === email);
    setSelectedFcmId(user ? user.fcmid : '');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/fcm/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fcmid: selectedFcmId,
          message,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Message sent successfully!');
        setMessage('');
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex items-start">
        <h1 className="text-2xl font-bold m-8 text-blue-700">Send Message</h1>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded shadow-md p-8">
            <h2 className="text-xl font-bold mb-4 text-blue-700">Select User</h2>
            {loading ? (
              <div className="text-center text-blue-600">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-600">{error}</div>
            ) : (
              <form onSubmit={handleSend}>
                <select
                  className="border rounded px-3 py-2 w-full text-blue-700 mb-4"
                  value={selectedUser}
                  onChange={handleUserChange}
                  required
                >
                  <option value="">-- Select User --</option>
                  {users.map((user) => (
                    <option key={user.fcmid} value={user.email}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full text-blue-700 mb-4"
                  placeholder="Type your message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow w-full"
                  disabled={sending || !selectedFcmId || !message}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
                {success && (
                  <div className="text-green-600 text-center mt-4">{success}</div>
                )}
                {error && (
                  <div className="text-red-600 text-center mt-4">{error}</div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}