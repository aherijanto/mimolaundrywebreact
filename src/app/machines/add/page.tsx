'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddMachinePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    code_machine: '',
    name_machine: '',
    brand_machine: '',
    model_machine: '',
    year_machine: '',
    status_machine: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Machine added successfully!');
        setTimeout(() => router.push('/machines'), 1000);
      } else {
        setError(data.error || 'Failed to add machine');
      }
    } catch (err) {
      setError('Failed to add machine');
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
        <h1 className="text-2xl font-bold mb-4 text-blue-600">Add Machine</h1>
        <input
          name="code_machine"
          placeholder="Code Machine"
          value={form.code_machine}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full text-blue-700"
          required
        />
        <input
          name="name_machine"
          placeholder="Name Machine"
          value={form.name_machine}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full text-blue-700"
          required
        />
        <input
          name="brand_machine"
          placeholder="Brand Machine"
          value={form.brand_machine}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full text-blue-700"
        />
        <input
          name="model_machine"
          placeholder="Model Machine"
          value={form.model_machine}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full text-blue-700"
        />
        <input
          name="year_machine"
          placeholder="Year Machine"
          value={form.year_machine}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full text-blue-700"
        />
        <input
          name="status_machine"
          placeholder="Status Machine"
          value={form.status_machine}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full text-blue-700"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Machine'}
        </button>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        {success && <div className="text-green-600 text-sm text-center">{success}</div>}
      </form>
    </div>
  );
}
