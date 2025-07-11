// This file is now obsolete. The dashboard page has moved to (authenticated)/dashboard/page.tsx.
// You can safely delete this file.
export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md flex flex-col gap-4">
        <h1 className="text-3xl font-bold mb-4 text-center text-blue-600">Dashboard</h1>
        <p className="text-center text-lg">Welcome! You are logged in.</p>
        {/* Add more dashboard content here */}
      </div>
    </div>
  );
}