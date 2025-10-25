"use client";

import React, { useState, useEffect, useRef } from "react";
import Signup from "../auth/signup/signup";
import { FaCheckCircle } from "react-icons/fa";
import "./Welcome.css";

const LOCAL_USERS_KEY = "modix_local_users";

interface LocalUser {
  username: string;
  password: string;
  role?: "Owner" | "Admin" | "SubUser";
  email?: string;
  createdAt?: string;
  lastLogin?: string;
}

// ---------------------------
// LocalStorage Helpers
// ---------------------------
const getLocalUsers = (): LocalUser[] => {
  const data = localStorage.getItem(LOCAL_USERS_KEY);
  if (!data) {
    const testUsers: LocalUser[] = [
      {
        username: "testuser",
        password: "test1234",
        role: "Owner",
        email: "test@example.com",
        createdAt: new Date().toISOString(),
      },
      {
        username: "admin",
        password: "admin123",
        role: "Admin",
        email: "admin@example.com",
        createdAt: new Date().toISOString(),
      },
      {
        username: "subuser1",
        password: "password1",
        role: "SubUser",
        email: "sub1@example.com",
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(testUsers));
    return testUsers;
  }
  return JSON.parse(data);
};

const saveLocalUsers = (users: LocalUser[]) =>
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

const saveLocalUser = (user: LocalUser) => {
  const users = getLocalUsers();
  users.push(user);
  saveLocalUsers(users);
};

// ---------------------------
// Component
// ---------------------------
export default function InstalledPage() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"login" | "signup" | "recover">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success" | "info";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const lastUser = localStorage.getItem("modix_last_username");
    if (lastUser) setUsername(lastUser);
    usernameRef.current?.focus();
  }, []);

  const resetMessages = () => setMessage(null);

  // ---------------------------
  // Login
  // ---------------------------
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    setTimeout(() => {
      try {
        if (!username.trim() || (!password.trim() && mode !== "recover"))
          throw new Error("All fields are required.");

        const users = getLocalUsers();
        const user = users.find((u) => u.username === username.trim());

        if (!user) throw new Error("User not found.");
        if (mode !== "recover" && user.password !== password)
          throw new Error("Incorrect password.");

        if (mode === "recover") {
          setMessage({
            text: `Recovery simulated for ${username}`,
            type: "info",
          });
          return;
        }

        user.lastLogin = new Date().toISOString();
        saveLocalUsers(users);

        localStorage.setItem("modix_user", JSON.stringify(user));
        rememberMe
          ? localStorage.setItem("modix_last_username", username)
          : localStorage.removeItem("modix_last_username");

        setMessage({
          text: `Login successful! Welcome ${user.username}`,
          type: "success",
        });
        setTimeout(() => (window.location.href = "/auth/myaccount"), 500);
      } catch (err: any) {
        setMessage({ text: err.message, type: "error" });
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  // ---------------------------
  // Signup
  // ---------------------------
  const handleSignup = (
    newUsername: string,
    newPassword: string,
    role: "Owner" | "Admin" | "SubUser" = "SubUser"
  ) => {
    resetMessages();
    const users = getLocalUsers();
    if (users.find((u) => u.username === newUsername)) {
      setMessage({ text: "Username already exists.", type: "error" });
      return;
    }

    saveLocalUser({
      username: newUsername,
      password: newPassword,
      role,
      createdAt: new Date().toISOString(),
    });

    setMessage({
      text: `User ${newUsername} registered successfully!`,
      type: "success",
    });
    setMode("login");
  };

  return (
    <main className="relative min-h-screen bg-[#0f0f0f] text-gray-200 px-6 py-12 font-sans flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Background gradients */}
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

      <div className="relative z-10 w-full max-w-6xl space-y-16">
        {/* Hero */}
        <section className="space-y-6 text-center max-w-3xl mx-auto">
          <FaCheckCircle
            size={72}
            className="text-green-500 mx-auto animate-bounce"
          />
          <h1 className="text-5xl md:text-6xl font-extrabold text-green-500 tracking-tight">
            Modix Game Panel
          </h1>
          <span className="inline-block mt-1 px-3 py-1 text-sm font-semibold text-black bg-green-500 rounded-full shadow">
            v1.1.2 — Unstable
          </span>
        </section>

        {/* Form Box */}
        {mode === "signup" ? (
          <Signup onBack={() => setMode("login")} onSignup={handleSignup} />
        ) : (
          <div className="mt-8 bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl p-8 max-w-md mx-auto text-left">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {mode === "recover" ? "Recover Account" : "🔐 Modix Login"}
            </h2>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  Username
                </label>
                <input
                  ref={usernameRef}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#121212] border border-gray-600 text-white focus:outline-none focus:border-green-500"
                  required
                />
              </div>

              {mode !== "recover" && (
                <div className="relative">
                  <label className="block text-gray-300 text-sm mb-1">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-[#121212] border border-gray-600 text-white focus:outline-none focus:border-green-500"
                    required
                  />
                  <span
                    className="absolute right-3 top-2.5 cursor-pointer text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </div>
              )}

              {mode === "login" && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    id="rememberMe"
                    className="accent-green-500"
                  />
                  <label htmlFor="rememberMe" className="text-gray-300 text-sm">
                    Remember Me
                  </label>
                </div>
              )}

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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-xl"
              >
                {loading
                  ? "Processing..."
                  : mode === "recover"
                  ? "Send Recovery Email"
                  : "🚀 Log In"}
              </button>
            </form>

            <p className="mt-4 text-sm text-center text-gray-400">
              {mode !== "recover" && (
                <strong
                  onClick={() => {
                    resetMessages();
                    setMode("recover");
                  }}
                  className="cursor-pointer hover:text-green-400 transition"
                >
                  Recover Account
                </strong>
              )}
              {mode === "login" && " | "}
              <strong
                onClick={() => {
                  resetMessages();
                  setMode("signup");
                }}
                className="cursor-pointer hover:text-green-400 transition"
              >
                Master Sign Up
              </strong>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
