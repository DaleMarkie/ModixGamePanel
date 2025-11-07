"use client";

import React, { useState, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import "./Welcome.css";

export default function InstalledPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success" | "info";
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [masterCreated, setMasterCreated] = useState(false);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("modix_local_users") || "[]");
    if (users.some((u: any) => u.role === "Owner")) setMasterCreated(true);
  }, []);

  const resetMessages = () => setMessage(null);

  const handleCreateMaster = () => {
    resetMessages();

    if (!username.trim() || !password || !confirmPassword) {
      setMessage({ text: "All fields are required.", type: "error" });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const users = JSON.parse(
        localStorage.getItem("modix_local_users") || "[]"
      );

      if (users.some((u: any) => u.role === "Owner")) {
        setMessage({
          text: "Master account already exists. You cannot create another.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      const masterUser = {
        username: username.trim(),
        password,
        role: "Owner",
        pages: ["Dashboard", "Settings", "Mods", "Terminal"],
      };

      users.push(masterUser);
      localStorage.setItem("modix_local_users", JSON.stringify(users));

      setMessage({
        text: "Master account created! Redirecting to login...",
        type: "success",
      });

      setTimeout(() => (window.location.href = "/auth/login"), 1500);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to create master account.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (masterCreated) {
    return (
      <main className="flex items-center justify-center min-h-screen text-gray-200 bg-[#0f0f0f] font-sans">
        <div className="text-center space-y-4">
          <FaCheckCircle size={64} className="text-green-500 mx-auto" />
          <h1 className="text-3xl font-bold text-green-500">
            Master Account Already Created
          </h1>
          <p className="text-gray-300">
            You already have a master account. Please{" "}
            <a href="/auth/login" className="text-green-400 underline">
              login
            </a>
            .
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#0f0f0f] text-gray-200 px-6 py-12 font-sans flex flex-col items-center justify-center text-center overflow-auto">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at top left, rgba(0, 255, 128, 0.06), transparent 40%),
            radial-gradient(circle at bottom right, rgba(255, 165, 0, 0.06), transparent 50%)
          `,
          opacity: 0.3,
        }}
      />

      <div className="relative z-10 w-full max-w-md space-y-8">
        <section className="space-y-4 text-center">
          <FaCheckCircle
            size={64}
            className="text-green-500 mx-auto animate-bounce"
          />
          <h1 className="text-4xl font-extrabold text-green-500 tracking-tight">
            Create Master Account
          </h1>
          <span className="inline-block mt-1 px-3 py-1 text-sm font-semibold text-black bg-green-500 rounded-full shadow">
            v1.1.2 — Setup
          </span>
        </section>

        <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl p-6 text-left space-y-4">
          {/* Warning */}
          <div className="bg-yellow-900 text-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg text-sm">
            <strong>Important:</strong> The Master account password{" "}
            <em>cannot</em> be recovered if lost. Make sure you remember it. If
            you forget it, the only way to regain access is to reinstall Modix.
          </div>

          {/* Message */}
          {message && (
            <div
              className={`text-sm text-center ${
                message.type === "error"
                  ? "text-red-500"
                  : message.type === "success"
                  ? "text-green-400"
                  : "text-white"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Inputs */}
          <div>
            <label className="block text-gray-300 text-sm mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#121212] border border-gray-600 text-white focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#121212] border border-gray-600 text-white focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#121212] border border-gray-600 text-white focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Button */}
          <button
            onClick={handleCreateMaster}
            disabled={loading}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-xl"
          >
            {loading ? "Processing..." : "🛡️ Create Master Account"}
          </button>
        </div>
      </div>
    </main>
  );
}
