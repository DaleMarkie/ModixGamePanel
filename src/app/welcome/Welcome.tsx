"use client";

import React, { useState, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import "./Welcome.css";

export default function InstalledPage() {
  const [masterCreated, setMasterCreated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showOwnerSetup, setShowOwnerSetup] = useState(false);
  const [showLicenseChoice, setShowLicenseChoice] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  /* -------------------------------------------------- */
  /*                 INITIAL CHECK                      */
  /* -------------------------------------------------- */
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("modix_local_users") || "[]");
    if (users.some((u) => u.role === "Owner")) setMasterCreated(true);

    const welcomeDismissed = localStorage.getItem("modix_welcome_dismissed");
    if (welcomeDismissed) setShowWelcome(false);
  }, []);

  /* -------------------------------------------------- */
  /*                 FORM HANDLERS                      */
  /* -------------------------------------------------- */
  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const showMessage = (text, type) =>
    setMessage({ text, type: type || "info" });

  const handleCreateMaster = () => {
    setMessage(null);

    const { username, password, confirmPassword } = form;

    if (!username.trim() || !password || !confirmPassword)
      return showMessage("All fields are required.", "error");

    if (password !== confirmPassword)
      return showMessage("Passwords do not match.", "error");

    if (password.length < 6)
      return showMessage("Password must be at least 6 characters.", "error");

    setLoading(true);

    try {
      const users = JSON.parse(
        localStorage.getItem("modix_local_users") || "[]"
      );

      if (users.some((u) => u.role === "Owner")) {
        showMessage(
          "Master account already exists. You cannot create another.",
          "error"
        );
        setLoading(false);
        return;
      }

      const newUser = {
        username: username.trim(),
        password,
        role: "Owner",
        pages: ["Dashboard", "Settings", "Mods", "Terminal"],
      };

      users.push(newUser);
      localStorage.setItem("modix_local_users", JSON.stringify(users));

      showMessage("Master account created! Redirecting…", "success");

      setTimeout(() => (window.location.href = "/auth/login"), 1500);
    } catch (err) {
      console.error(err);
      showMessage("Unexpected error creating account.", "error");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------- */
  /*                MASTER ALREADY CREATED              */
  /* -------------------------------------------------- */
  if (masterCreated) {
    return (
      <main className="flex items-center justify-center min-h-screen text-gray-200 bg-[#0f0f0f] font-sans">
        <div className="text-center space-y-6 animate-fadeDown max-w-xl">
          <FaCheckCircle size={64} className="text-green-500 mx-auto" />
          <h1 className="text-3xl font-bold text-green-500">
            Owner Account Already Exists
          </h1>
          <p className="text-gray-300 text-lg">
            A master (owner) account has already been created for this Modix
            installation. The owner account has full control over:
          </p>
          <ul className="text-gray-400 text-left list-disc list-inside mx-auto max-w-md space-y-1">
            <li>Server and panel settings</li>
            <li>User permissions and roles</li>
            <li>Security configurations</li>
            <li>
              Access to all features including mods, logs, and file management
            </li>
          </ul>
          <p className="text-gray-300 mt-4">
            To continue, please{" "}
            <a
              href="/auth/login"
              className="text-green-400 underline font-semibold"
            >
              log in with the owner account
            </a>
            . If you do not have access to the credentials, contact your system
            administrator.
          </p>
        </div>
      </main>
    );
  }

  /* -------------------------------------------------- */
  /*                        UI                          */
  /* -------------------------------------------------- */
  return (
    <main className="relative min-h-screen bg-[#0f0f0f] text-gray-200 px-6 py-12 font-sans flex flex-col items-center justify-center text-center overflow-auto">
      {/* Soft gradient background */}
      <div
        className="absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at top left, rgba(0,255,128,0.06), transparent 40%),
            radial-gradient(circle at bottom right, rgba(255,165,0,0.06), transparent 50%)
          `,
        }}
      />

      {/* -------------------------------------------------- */}
      {/*                    WELCOME CARD                   */}
      {/* -------------------------------------------------- */}
      {showWelcome && (
        <div className="relative z-20 mb-10 p-8 rounded-2xl bg-[#121212]/80 backdrop-blur-xl border border-[#222] shadow-xl max-w-2xl animate-fadeDown">
          <h1 className="text-5xl font-extrabold text-green-400 drop-shadow">
            Welcome to Modix
          </h1>

          <p className="mt-4 text-gray-300 text-lg leading-relaxed max-w-xl mx-auto">
            Modix Game Panel is a complete, modern server management suite with
            tools for automation, monitoring, mods, logs, files, and secure
            control.
          </p>

          <div className="mt-6 flex justify-center gap-4 text-sm text-gray-200">
            <span className="px-4 py-2 rounded-full bg-green-700/30 border border-green-600">
              🚀 Fast & Lightweight
            </span>
            <span className="px-4 py-2 rounded-full bg-blue-700/30 border border-blue-600">
              🎮 Server Control
            </span>
            <span className="px-4 py-2 rounded-full bg-purple-700/30 border border-purple-600">
              🔧 Mod Manager
            </span>
          </div>

          {/* BUTTON TO PROCEED */}
          <button
            onClick={() => {
              localStorage.setItem("modix_welcome_dismissed", "true");
              setShowOwnerSetup(true);
              setShowWelcome(false);
            }}
            className="mt-6 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-xl"
          >
            ➡️ Proceed to Owner Account Setup
          </button>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/*               OWNER ACCOUNT BUTTON                */}
      {/* -------------------------------------------------- */}
      {showOwnerSetup && !showLicenseChoice && !showSignupForm && (
        <div className="relative z-10 w-full max-w-md space-y-8 animate-fadeUp">
          <section className="space-y-4 text-center">
            <FaCheckCircle
              size={64}
              className="text-green-500 mx-auto animate-bounce"
            />

            <h1 className="text-4xl font-extrabold text-green-500 tracking-tight">
              System Setup Required
            </h1>

            <span className="inline-block mt-1 px-3 py-1 text-sm font-semibold text-black bg-green-500 rounded-full shadow">
              v1.1.2 — Setup
            </span>

            <p className="text-gray-400 text-sm italic mt-2">
              Before continuing, create the owner account. This account will
              control all server settings, security, and panel management.
            </p>
          </section>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => setShowLicenseChoice(true)}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-xl"
            >
              ➕ Create Owner Account
            </button>

            <button
              onClick={() => setShowOwnerSetup(false)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-xl"
            >
              ⬅️ Back
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/*               LICENSE CHOICE SCREEN               */}
      {/* -------------------------------------------------- */}
      {showLicenseChoice && !showSignupForm && (
        <div className="relative z-10 w-full max-w-3xl space-y-8 animate-fadeUp">
          <h2 className="text-4xl font-extrabold text-green-500 mb-6">
            Choose Your License
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Use License */}
            <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl p-6 text-left hover:border-green-500 transition-all cursor-pointer">
              <h3 className="text-2xl font-bold text-green-400 mb-2">
                Personal Use
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Non-commercial license for personal servers. You can freely
                modify, edit, and customize the panel. No charges for casual
                users maintaining personal servers.
              </p>
              <button
                onClick={() => setShowSignupForm(true)}
                className="bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-xl"
              >
                Select Personal
              </button>
            </div>

            {/* Host Provider License */}
            <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl p-6 text-left hover:border-blue-500 transition-all cursor-pointer">
              <h3 className="text-2xl font-bold text-blue-400 mb-2">
                Host Provider
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Commercial license for hosting services or reselling servers.
                Contact us for pricing and terms.
              </p>
              <button
                onClick={() =>
                  alert("Host Provider signup not implemented yet")
                }
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-xl"
              >
                Select Host Provider
              </button>
            </div>
          </div>

          {/* BACK BUTTON */}
          <button
            onClick={() => setShowLicenseChoice(false)}
            className="mt-6 w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-xl"
          >
            ⬅️ Back
          </button>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/*           PERSONAL USE SIGNUP FORM                 */}
      {/* -------------------------------------------------- */}
      {showSignupForm && (
        <div className="relative z-10 w-full max-w-md space-y-8 animate-fadeUp">
          <section className="space-y-4 text-center">
            <FaCheckCircle
              size={64}
              className="text-green-500 mx-auto animate-bounce"
            />

            <h1 className="text-4xl font-extrabold text-green-500 tracking-tight">
              Create Master Account
            </h1>

            <span className="inline-block mt-1 px-3 py-1 text-sm font-semibold text-black bg-green-500 rounded-full shadow">
              v1.1.2 — Personal Use
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

            {/* Input Fields */}
            {["username", "password", "confirmPassword"].map((field) => (
              <div key={field}>
                <label className="block text-gray-300 text-sm mb-1">
                  {field === "confirmPassword"
                    ? "Confirm Password"
                    : field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field.includes("password") ? "password" : "text"}
                  value={form[field]}
                  onChange={(e) => updateField(field, e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#121212] border border-gray-600 text-white focus:outline-none focus:border-green-500"
                />
              </div>
            ))}

            {/* Button */}
            <button
              onClick={handleCreateMaster}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-xl disabled:opacity-50"
            >
              {loading ? "Processing…" : "🛡️ Create Master Account"}
            </button>

            {/* BACK BUTTON */}
            <button
              onClick={() => setShowSignupForm(false)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-xl"
            >
              ⬅️ Back
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
