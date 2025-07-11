'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/fcm?email=" + encodeURIComponent(email), {
        method: "GET",
      });
      const data = await res.json();
      if (res.ok && data.user && data.user.pass === pass) {
        setSuccess("Login successful!");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      } else {
        setError("Invalid email or password.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm flex flex-col gap-4"
      >
        <div className="flex justify-center mb-2">
          <img src="/logo.png" alt="Logo" className="h-32 w-auto" />
        </div>
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded px-3 py-2 w-full text-blue-600"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="border rounded px-3 py-2 w-full text-blue-600"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}
        {success && (
          <div className="text-green-600 text-sm text-center">{success}</div>
        )}
      </form>
    </div>
  );
}
