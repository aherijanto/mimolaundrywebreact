'use client';
import React, { useEffect, useState } from 'react';

interface Transaction {
  id: number;
  no_trans: string;
  code_machine: string;
  request_by: string;
  date_trans: string;
  order_from: string; // New field to indicate where the order came from
  payment_status: boolean;
}

export default function ActiveRunningTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        // Only show unpaid transactions
        setTransactions((data.transactions || []).filter((t: Transaction) => !t.payment_status));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch transactions');
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 w-full">
      <div className="flex items-start">
        <h1 className="text-2xl font-bold m-8 text-red-600">Active Running</h1>
      </div>
      <div className="flex-1 w-full flex justify-center">
        <div className="w-full max-w-5xl mx-4">
          <div className="bg-white rounded shadow-md p-4">
            {loading ? (
              <div className="text-center mt-8">Loading...</div>
            ) : error ? (
              <div className="text-red-600 text-center mt-8">{error}</div>
            ) : transactions.length === 0 ? (
              <div className="text-center mt-8">No transactions found.</div>
            ) : (
              <div className="overflow-auto">
                <table className="min-w-full w-full text-sm">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-3 py-2 text-left text-gray-600 font-semibold">No</th>
                      <th className="px-3 py-2 text-left text-gray-600 font-semibold">Transaction No</th>
                      <th className="px-3 py-2 text-left text-gray-600 font-semibold">Machine</th>
                      <th className="px-3 py-2 text-left text-gray-600 font-semibold">Requested By</th>
                      <th className="px-3 py-2 text-left text-gray-600 font-semibold">Date</th>
                      <th className="px-3 py-2 text-left text-gray-600 font-semibold">Order From</th>
                      <th className="px-3 py-2 text-left text-gray-600 font-semibold">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t, idx) => (
                      <tr key={t.id} className="odd:bg-white even:bg-gray-50 transition hover:bg-red-50">
                        <td className="px-3 py-2 text-center text-blue-600 font-medium">{idx + 1}</td>
                        <td className="px-3 py-2 text-blue-600 font-semibold">{t.no_trans}</td>
                        <td className="px-3 py-2 text-blue-600">{t.code_machine}</td>
                        <td className="px-3 py-2 text-blue-600">{t.request_by}</td>
                        <td className="px-3 py-2 text-blue-600">{
                          new Date(t.date_trans).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
                        }</td>
                        <td className="px-3 py-2 text-blue-600">{t.order_from}</td>
                        <td className="px-3 py-2 text-center text-blue-600 font-semibold">
                          {t.payment_status ? (
                            <span>Paid</span>
                          ) : (
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded shadow"
                              type="button"
                            >
                              Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
