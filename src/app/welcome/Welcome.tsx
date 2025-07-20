"use client";
import React from "react";
import Link from "next/link";
import {
  FaDiscord,
  FaCoffee,
  FaCheckCircle,
  FaGamepad,
  FaBookOpen,
  FaLifeRing,
} from "react-icons/fa";

export default function InstalledPage() {
  return (
    <main className="relative min-h-screen bg-[#121212] text-gray-200 px-6 py-12 font-sans flex flex-col items-center justify-center text-center space-y-10 overflow-hidden">
      {/* ✨ Background Layer */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at top left, rgba(0, 255, 128, 0.1), transparent 40%),
            radial-gradient(circle at bottom right, rgba(255, 165, 0, 0.1), transparent 50%),
            url('/background-texture.svg')
          `,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          opacity: 0.2,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-10 w-full">
        {/* Header */}
        <section className="space-y-3">
          <FaCheckCircle size={54} className="text-green-500 mx-auto" />
          <h1 className="text-4xl font-bold text-green-500 select-none flex items-center justify-center gap-3">
            Modix: Game Panel
            <span className="text-xs bg-green-600 text-white font-semibold px-2 py-0.5 rounded-md shadow-sm border border-green-400">
              v1.1.2
            </span>
          </h1>
          <p className="text-base md:text-lg max-w-2xl text-gray-300 leading-relaxed mx-auto">
            Built from the ground up to empower both casual gamers and dedicated
            server owners, Modix is a web-based, browser-hosted game panel
            running on Linux and Docker. Launched in 2024 and actively developed
            with long-term support, innovation, and ease of use at its core.
          </p>
          <p className="text-sm text-gray-400 italic">
            Developed by{" "}
            <span className="text-white font-semibold">OV3RLORD</span> &{" "}
            <span className="text-white font-semibold">GameSmithOnline</span>
          </p>
        </section>

        {/* Info */}
        <section className="bg-[#1e1e1e]/90 backdrop-blur-md rounded-xl p-6 w-full max-w-2xl text-left space-y-5 shadow-lg border border-green-900/20">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-green-400 tracking-wide">
              🚀 Get Started
            </h2>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                Access your server panel to manage and monitor gameplay.
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                Install, update, and organize mods effortlessly.
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                Customize server settings with precision.
              </li>
            </ul>
          </div>
          <p className="text-sm text-gray-400 italic">
            Official downloads only from{" "}
            <a
              href="https://modix.store"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:underline"
            >
              modix.store
            </a>{" "}
            or GitHub.
          </p>
        </section>

        {/* CTA Buttons */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl">
          <Link
            href="/auth/login"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <FaGamepad />
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="bg-orange-400 hover:bg-orange-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <FaLifeRing />
            Sign Up
          </Link>
          <Link
            href="/recover"
            className="border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <FaBookOpen />
            Recover
          </Link>
        </section>

        {/* Support & Community */}
        <section className="space-y-3 text-sm text-gray-400 max-w-sm">
          <p>Need support or want to connect with other Modix users?</p>
          <div className="flex justify-center gap-4">
            <a
              href="https://discord.gg/EwWZUSR9tM"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium py-2 px-4 rounded-md flex items-center gap-2 transition"
            >
              <FaDiscord />
              Discord
            </a>
            <a
              href="https://ko-fi.com/modixgamepanel"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#ff5e57] hover:bg-[#e04a46] text-white font-medium py-2 px-4 rounded-md flex items-center gap-2 transition"
            >
              <FaCoffee />
              Ko-fi
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
