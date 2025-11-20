"use client";

import React, { useState, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import Terms from "../support/terms/Terms"; // your existing Terms page
import "./Setup.css";

export default function SetupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [license, setLicense] = useState<"free" | "pro" | null>("free");
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success" | "info";
  } | null>(null);
  const [masterCreated, setMasterCreated] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("modix_local_users") || "[]");
    if (users.some((u: any) => u.role === "Owner")) setMasterCreated(true);
  }, []);

  const resetMessages = () => setMessage(null);

  const handleNext = () => {
    resetMessages();

    if (!username.trim() || !password || !confirmPassword) {
      setMessage({ text: "All fields are required.", type: "error" });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    if (!license) {
      setMessage({ text: "Please select a license type.", type: "error" });
      return;
    }

    // Show Terms page inline
    setShowTerms(true);
  };

  const handleCreateMaster = () => {
    try {
      const users = JSON.parse(
        localStorage.getItem("modix_local_users") || "[]"
      );
      if (users.some((u: any) => u.role === "Owner")) {
        setMessage({ text: "Master account already exists.", type: "error" });
        return;
      }

      const masterUser = {
        username: username.trim(),
        password,
        license,
        role: "Owner",
        pages: ["Dashboard", "Settings", "Mods", "Terminal"],
      };

      users.push(masterUser);
      localStorage.setItem("modix_local_users", JSON.stringify(users));
      setMasterCreated(true);
      setMessage({
        text: "Master account created successfully!",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to create master account.", type: "error" });
    }
  };

  if (masterCreated) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#0f0f0f] font-sans px-6 text-center">
        <div className="max-w-lg space-y-6">
          <FaCheckCircle
            size={80}
            className="text-green-500 mx-auto animate-bounce"
          />
          <h1 className="text-4xl font-extrabold text-green-500 tracking-tight">
            Master Account Created!
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            🎉 Thank you for choosing{" "}
            <span className="text-green-400 font-semibold">Modix</span>! We’re
            thrilled to have you on board. Dive in and enjoy the full freedom,
            flexibility, and control Modix gives you over your servers.
            <span className="block mt-2 text-yellow-400 font-medium">
              Happy managing, and may your servers run smoothly!
            </span>
            <span className="block mt-3 text-gray-400 text-sm">
              If you encounter any issues, reach out to us on{" "}
              <a
                href="https://discord.gg/EwWZUSR9tM"
                className="text-blue-400 underline"
              >
                Discord
              </a>{" "}
              or report them on{" "}
              <a
                href="https://github.com/DaleMarkie/ModixGamePanel"
                className="text-blue-400 underline"
              >
                GitHub
              </a>
              .
            </span>
          </p>

          <p className="text-gray-400 text-sm italic">— Thanks, OV3RLORD</p>
          <div className="mt-4">
            <a
              href="/auth/login"
              className="inline-block bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-xl transition-all"
            >
              Proceed to Login
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (showTerms) {
    return (
      <div>
        <Terms />
        <div className="w-full max-w-md mx-auto mt-6 px-4">
          {message && (
            <div
              className={`text-center text-sm mb-2 ${
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
          <button
            onClick={handleCreateMaster}
            className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-xl"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#0f0f0f] text-gray-200 px-6 py-12 font-sans flex flex-col items-center justify-center text-center overflow-auto">
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

          {/* Username */}
          <div>
            <label className="block text-gray-300 text-sm mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#121212] border border-gray-600 text-white focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-300 text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#121212] border border-gray-600 text-white focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Confirm Password */}
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

          {/* License selection */}
          <div className="license-container">
            <label className="block text-gray-300 text-sm mb-2">
              License Type
            </label>
            <div className="license-options flex gap-4">
              <div
                className={`license-box cursor-pointer p-3 rounded-lg border ${
                  license === "free" ? "border-green-400" : "border-gray-600"
                } bg-[#121212]`}
                onClick={() => setLicense("free")}
              >
                <h3 className="text-green-400 font-semibold">Free Forever</h3>
                <p className="text-gray-300 text-sm">Non-commercial use only</p>
              </div>
              <div
                className="license-box cursor-not-allowed p-3 rounded-lg border border-gray-600 bg-[#121212] opacity-50"
                title="Pro License not available"
              >
                <h3 className="text-red-500 font-semibold">Pro License</h3>
                <p className="text-gray-300 text-sm">
                  For commercial/server hosting
                </p>
              </div>
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-xl"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
