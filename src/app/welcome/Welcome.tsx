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
    <div className="min-h-screen bg-[#121212] text-gray-200 flex flex-col items-center justify-center px-4 py-12 font-sans max-w-5xl mx-auto space-y-7 text-center">
      <FaCheckCircle size={60} className="text-green-500 mb-1.5 select-none" />

      <h1 className="text-3xl md:text-4xl font-extrabold text-green-500 leading-tight select-none">
        🎉 Welcome to Modix!
      </h1>

      <p className="text-sm md:text-base max-w-xl text-gray-300 font-medium leading-relaxed select-none">
      Modix Game Panel is a feature-rich server manager designed specifically for Project Zomboid. Built from scratch with modding, performance, and ease of use in mind, Modix is a serious alternative to outdated tools like TCAdmin, AMP, or GameCP optimized for Linux VPS and dedicated servers. Developed By OV3RLORD & GameSmithOnline.
      </p>

      <section className="max-w-md mx-auto text-sm text-gray-400 italic mt-4">
        <p className="mb-3 font-semibold text-gray-300">
        Manage your mods, customize settings, and monitor gameplay all within one sleek, modern interface.
        </p>
        <p className="font-normal">
        Download exclusively from the official GitHub repository to ensure security and authenticity or from our website https://modix.store
        </p>

      </section>

      <section className="bg-[#1e1e1e] rounded-xl p-6 w-full max-w-lg text-left">
        <h2 className="text-lg font-semibold text-green-400 mb-3 tracking-wide">
          What’s next?
        </h2>
        <ul className="space-y-3 text-sm text-gray-300">
          <li className="flex items-center gap-2">
            <FaCheckCircle className="text-green-500" />
            Explore the <strong className="font-semibold">Login</strong> to view
            your server status and quick actions.
          </li>
          <li className="flex items-center gap-2">
            <FaCheckCircle className="text-green-500" />
            Manage your mods easily and keep your gameplay fresh and exciting.
          </li>
          <li className="flex items-center gap-2">
            <FaCheckCircle className="text-green-500" />
            Customize your server settings with ease for the best experience.
          </li>
        </ul>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg mt-6">
        <Link
          href="/auth/login"
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
        >
          <FaGamepad className="text-sm" />
          Login
        </Link>
        <Link
          href="/auth/signup"
          className="bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
        >
          <FaLifeRing className="text-sm" />
          Sign Up
        </Link>
        <Link
          href="/recover"
          className="border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
        >
          <FaBookOpen className="text-sm" />
          Recover Account
        </Link>
      </div>

      <div className="text-xs text-gray-500 mt-6 max-w-sm leading-relaxed">
        <p>
          Need help or want to connect with fellow users? Join our community on
          Discord or support the project on Ko-fi!
        </p>
      </div>

      <div className="flex gap-4">
        <a
          href="https://discord.gg/EwWZUSR9tM"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 transition-all"
        >
          <FaDiscord className="text-sm" />
          Discord
        </a>
        <a
          href="https://ko-fi.com/modixgamepanel"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#ff5e57] hover:bg-[#e04a46] text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 transition-all"
        >
          <FaCoffee className="text-sm" />
          Ko-fi
        </a>
      </div>
    </div>
  );
}
