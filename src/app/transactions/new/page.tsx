'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewTransactionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    no_trans: '',
    code_machine: '',
    request_by: '',
    date_trans: '',
    payment_status: false,
    order_from: 'web', // Add default value
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userOptions, setUserOptions] = useState<string[]>([]);
  const [machineOptions, setMachineOptions] = useState<{ code_machine: string; name?: string }[]>([]);

  React.useEffect(() => {
    // Set request_by from localStorage if available
    const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : '';
    // Set date_trans to now in datetime-local format
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateLocal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setForm((prev) => ({
      ...prev,
      request_by: email || prev.request_by,
      date_trans: dateLocal,
    }));
    // Generate transaction number based on total records in table
    fetch('/api/transactions?all=1')
      .then(res => res.json())
      .then(data => {
        let seq = 1;
        if (data.transactions && Array.isArray(data.transactions)) {
          seq = data.transactions.length + 1;
        }
        const y = now.getFullYear();
        const m = pad(now.getMonth() + 1);
        const d = pad(now.getDate());
        const no_trans = `Mimo${y}${m}${d}.${seq}`;
        setForm(prev => ({ ...prev, no_trans }));
      })
      .catch(() => {
        const y = now.getFullYear();
        const m = pad(now.getMonth() + 1);
        const d = pad(now.getDate());
        const no_trans = `Mimo${y}${m}${d}.1`;
        setForm(prev => ({ ...prev, no_trans }));
      });
  }, []);

  React.useEffect(() => {
    // Example: get users from localStorage (set on login success)
    // You should replace this with a fetch to /api/fcm if you want all users from DB
    const users = localStorage.getItem('allUsers');
    if (users) {
      setUserOptions(JSON.parse(users));
    } else {
      // fallback: use the logged-in user only
      const email = localStorage.getItem('userEmail');
      if (email) setUserOptions([email]);
    }
  }, []);

  React.useEffect(() => {
    // Fetch machines from API
    fetch('/api/machines')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.machines)) {
          setMachineOptions(data.machines);
        }
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Transaction added successfully!');
        setTimeout(() => router.push('/transactions'), 1000);
      } else {
        setError(data.error || 'Failed to add transaction');
      }
    } catch (err) {
      setError('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-lg flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold mb-4 text-blue-600">New Transaction</h1>
        <div className="flex gap-4 items-center">
          <input
            name="no_trans"
            placeholder="Transaction Number"
            value={form.no_trans}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full bg-gray-100 cursor-not-allowed text-green-900"
            required
            readOnly
          />
        </div>
        <select
          name="code_machine"
          value={form.code_machine}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full text-green-900"
          required
        >
          <option value="">Select Machine</option>
          {machineOptions.map((m) => (
            <option key={m.code_machine} value={m.code_machine}>
              {m.code_machine}{m.name ? ` - ${m.name}` : ''}
            </option>
          ))}
        </select>
        <input
          name="request_by"
          placeholder="Requested By"
          value={form.request_by}
          className="border rounded px-3 py-2 w-full bg-gray-100 cursor-not-allowed text-green-900"
          required
          readOnly
        />
        <input
          name="date_trans"
          type="datetime-local"
          value={form.date_trans}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full text-green-900"
          required
          readOnly
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="payment_status"
            checked={form.payment_status}
            onChange={handleChange}
          />
          Payment Status (Paid)
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Transaction'}
        </button>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        {success && <div className="text-green-600 text-sm text-center">{success}</div>}
      </form>
    </div>
  );
}
