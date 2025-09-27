"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getServerUrl } from "@/app/config"; // reuse your config
import {
  FaDiscord,
  FaCoffee,
  FaCheckCircle,
  FaYoutube,
  FaSteam,
  FaTerminal,
  FaFolderOpen,
  FaUsers,
  FaCogs,
  FaPuzzlePiece,
  FaBug,
  FaShieldAlt,
  FaChartLine,
  FaLink,
} from "react-icons/fa";
import type { IconType } from "react-icons";

import "./Welcome.css";

export default function InstalledPage() {
  const router = useRouter();
  const usernameRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [license, setLicense] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success" | "info";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const lastUser = localStorage.getItem("modix_last_username");
    const lastLicense = localStorage.getItem("modix_last_license");
    if (lastUser) setUsername(lastUser);
    if (lastLicense) setLicense(lastLicense);
    usernameRef.current?.focus();
  }, []);

  const resetMessages = () => setMessage(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (!username || !password || !license) {
        throw new Error("All fields are required.");
      }

      const res = await fetch(`${getServerUrl()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, license_code: license }),
      });

      const result = await res.json();

      if (res.ok && result.token) {
        localStorage.setItem("modix_token", result.token);
        localStorage.setItem("modix_user", JSON.stringify(result.user));

        if (rememberMe) {
          localStorage.setItem("modix_last_username", username);
          localStorage.setItem("modix_last_license", license);
        } else {
          localStorage.removeItem("modix_last_username");
          localStorage.removeItem("modix_last_license");
        }

        router.push("/auth/myaccount");
      } else {
        let msg = result.message || "Something went wrong.";
        if (msg.includes("License")) msg = `⚠️ ${msg}`;
        throw new Error(msg);
      }
    } catch (err: any) {
      console.error(err);
      setMessage({
        text: err.message || "Server error. Try again later.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#121212] text-gray-200 px-6 py-12 font-sans flex flex-col items-center justify-center text-center space-y-16 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at top left, rgba(0, 255, 128, 0.08), transparent 40%),
            radial-gradient(circle at bottom right, rgba(255, 165, 0, 0.08), transparent 50%)
          `,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          opacity: 0.3,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl space-y-20">
        {/* Hero Section */}
        <section className="space-y-6 text-center max-w-3xl mx-auto">
          {React.createElement(
            FaCheckCircle as React.ComponentType<{
              size?: number;
              className?: string;
            }>,
            {
              size: 64,
              className: "text-green-500 mx-auto",
            }
          )}
          <h1 className="text-5xl font-bold text-green-500">
            Modix Game Panel
          </h1>
          Modix Game Panel is a powerful, feature-packed server manager crafted
          exclusively for Project Zomboid. Engineered from the ground up with
          modding, performance, and usability at its core, Modix delivers a
          sleek, modern interface that makes server administration simple and
          efficient. It’s a serious, fully modern alternative to outdated tools
          like TCAdmin, AMP, or GameCP, giving server owners full control over
          gameplay, mods, players, and real-time analytics. Devloped By OV3RLORD
          <p className="text-sm text-gray-500 italic">
            v1.1.2 — Unstable Release
          </p>
          {/* Quick Login Box */}
          <div className="mt-6 bg-[#1e1e1e] border border-gray-700 rounded-lg shadow-lg p-6 max-w-sm mx-auto text-left">
            <h2 className="text-lg font-semibold text-white mb-4 text-center">
              🔐 Modix Login
            </h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  Username
                </label>
                <input
                  ref={usernameRef}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#121212] border border-gray-600 text-white focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#121212] border border-gray-600 text-white focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  License Code
                </label>
                <input
                  type="text"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#121212] border border-gray-600 text-white focus:outline-none focus:border-green-500"
                  required
                />
                <p className="text-gray-400 text-xs mt-1">
                  Use <strong>FREE</strong> for core features
                </p>
              </div>
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
                className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded transition"
              >
                {loading ? "Processing..." : "🚀 Log In"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
