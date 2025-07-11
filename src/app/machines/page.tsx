'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Machine {
  id: number;
  code_machine: string;
  name_machine: string;
  brand_machine: string;
  model_machine: string;
  year_machine: string;
  status_machine: string;
}

export default function MachinesPage() {
  const router = useRouter();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMachines() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/machines');
        const data = await res.json();
        if (res.ok) {
          setMachines(data.machines || []);
        } else {
          setError(data.error || 'Failed to fetch machines');
        }
      } catch (err) {
        setError('Failed to fetch machines');
      } finally {
        setLoading(false);
      }
    }
    fetchMachines();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex items-center justify-between px-8 py-6">
        <h1 className="text-3xl font-bold text-blue-600">Machines</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition-colors"
          onClick={() => router.push('/machines/add')}
        >
          Add Machines
        </button>
      </div>
      <div className="flex-1 px-8">
        {loading ? (
          <div className="text-center text-gray-500">Loading machines...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : machines.length === 0 ? (
          <div className="text-center text-gray-500">No machines found.</div>
        ) : (
          <table className="min-w-full bg-white rounded shadow-md text-blue-900">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b text-center">Code</th>
                <th className="px-4 py-2 border-b text-center">Name</th>
                <th className="px-4 py-2 border-b text-center">Brand</th>
                <th className="px-4 py-2 border-b text-center">Model</th>
                <th className="px-4 py-2 border-b text-center">Year</th>
                <th className="px-4 py-2 border-b text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-2 border-b text-center">{m.code_machine}</td>
                  <td className="px-4 py-2 border-b">{m.name_machine}</td>
                  <td className="px-4 py-2 border-b text-center">{m.brand_machine}</td>
                  <td className="px-4 py-2 border-b text-center">{m.model_machine}</td>
                  <td className="px-4 py-2 border-b text-center">{m.year_machine}</td>
                  <td className="px-4 py-2 border-b text-center">{m.status_machine}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}