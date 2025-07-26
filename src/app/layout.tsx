"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaHome, FaPlus, FaList, FaMobileAlt, FaHistory, FaCog, FaUsers, FaEnvelope, FaThLarge, FaUserShield } from "react-icons/fa";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


// Simple navigation drawer component
function NavigationDrawer({ onLogout }: { onLogout: () => void }) {
  const router = useRouter();
  const [showTransactions, setShowTransactions] = useState(false);
  return (
    <nav
      className="h-screen w-56 bg-blue-700 text-white flex flex-col shadow-lg z-30 fixed left-0 top-0 md:static md:block transition-all duration-200"
      style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #2563eb 100%)' }}
    >
      <div className="p-6 font-bold text-xl border-b border-blue-800">MimoLaundry</div>
      <ul className="flex-1 p-4 flex flex-col gap-2">
        <li>
          <button
            className="w-full text-left hover:bg-blue-800 rounded px-3 py-2 flex items-center gap-2"
            onClick={() => router.push("/dashboard")}
          >
            <FaHome />Dashboard
          </button>
        </li>
        {/* Dropdown menu for Transactions */}
        <li className="relative">
          <button
            className="w-full text-left hover:bg-blue-800 rounded px-3 py-2 flex items-center justify-between"
            onClick={() => setShowTransactions((v) => !v)}
            aria-expanded={showTransactions}
            aria-controls="transactions-submenu"
          >
            <FaList /> Transactions
            <span className="ml-2">{showTransactions ? "▲" : "▼"}</span>
          </button>
          {/* Submenu appears below the Transactions button */}
          {showTransactions && (
            <ul
              id="transactions-submenu"
              className="flex flex-col mt-1 ml-4 bg-blue-800 rounded shadow-lg z-40"
            >
              <li>
                <button
                  className="w-full text-left hover:bg-blue-900 rounded px-3 py-2 flex items-center gap-2"
                  onClick={() => router.push("/transactions/new")}
                >
                  <FaPlus /> New Order
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left hover:bg-blue-900 rounded px-3 py-2 flex items-center gap-2"
                  onClick={() => router.push("/transactions/activerunning")}
                >
                  <FaThLarge /> Active Orders
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left hover:bg-blue-900 rounded px-3 py-2 flex items-center gap-2"
                  onClick={() => router.push("/transactions/ordermobile")}
                >
                  <FaMobileAlt /> Orders From Mobile
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left hover:bg-blue-900 rounded px-3 py-2 flex items-center gap-2"
                  onClick={() => router.push("/transactions/history")}
                >
                  <FaHistory /> Orders History
                </button>
              </li>
            </ul>
          )}
        </li>
        <li>
          <button
            className="w-full text-left hover:bg-blue-800 rounded px-3 py-2 flex items-center gap-2"
            onClick={() => router.push("/machines")}
          >
            <FaCog /> Machines
          </button>
        </li>
        <li>
          <button
            className="w-full text-left hover:bg-blue-800 rounded px-3 py-2 flex items-center gap-2"
            onClick={() => router.push("/dashboard")}
          >
            <FaThLarge /> Lots
          </button>
        </li>
        <li>
          <button
            className="w-full text-left hover:bg-blue-800 rounded px-3 py-2 flex items-center gap-2"
            onClick={() => router.push("/dashboard")}
          >
            <FaUserShield /> Group Access
          </button>
        </li>
        <li>
          <button
            className="w-full text-left hover:bg-blue-800 rounded px-3 py-2 flex items-center gap-2"
            onClick={() => router.push("/users")}
          >
            <FaUsers /> Users
          </button>
        </li>

        <li>
          <button
            className="w-full text-left hover:bg-blue-800 rounded px-3 py-2 flex items-center gap-2"
            onClick={() => router.push("/fcm-messaging")}
          >
            <FaEnvelope /> Send Message
          </button>
        </li>
      </ul>
      <button
        className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded font-semibold hover:bg-blue-200 mb-2 self-end"
        style={{ marginTop: "auto" }}
        onClick={onLogout}
      >
        Logout
      </button>
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
    if (!loggedIn && pathname !== "/") {
      router.replace("/");
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    router.replace("/");
  };

  const isLoginPage = pathname === "/";
  const showDrawer = isLoggedIn && !isLoginPage;

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden bg-white`}>
        <div className="flex min-h-screen">
          {showDrawer && <NavigationDrawer onLogout={handleLogout} />}
          <main className={`flex-1 transition-all duration-200 min-h-screen ${showDrawer ? "ml-0 md:ml-0" : ""}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
