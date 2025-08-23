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
import { SiDocker } from "react-icons/si";

export default function InstalledPage() {
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
          <FaCheckCircle size={64} className="text-green-500 mx-auto" />
          <h1 className="text-5xl font-bold text-green-500">
            Modix Game Panel
          </h1>
          <p className="text-lg max-w-3xl mx-auto text-gray-300 leading-relaxed">
            A complete, web-based control panel for game server owners.
            <br />
            <span className="text-white font-semibold">
              Fast, Secure, Free
            </span>{" "}
            — with everything from mod management to real-time analytics.
            <br />
            Developed by The Modix Team: OV3RLORD & GameSmithOnline.
          </p>
          <p className="text-sm text-gray-500 italic">
            v1.1.2 — Unstable Release
          </p>
        </section>

        {/* Feature Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          <FeatureCard
            icon={<FaTerminal className="text-green-400" />}
            title="Live Terminal"
            description="Interact with your servers in real-time: view logs, execute commands, and troubleshoot instantly from anywhere."
          />
          <FeatureCard
            icon={<FaFolderOpen className="text-yellow-400" />}
            title="File Manager"
            description="Browse, upload, edit, and organize server files seamlessly — directly connected to your server's filesystem."
          />
          <FeatureCard
            icon={<FaUsers className="text-blue-400" />}
            title="Player Manager"
            description="Monitor and manage connected players: kick, ban, or inspect profiles with full Steam integration."
          />
          <FeatureCard
            icon={<FaPuzzlePiece className="text-pink-400" />}
            title="Mod & Workshop Manager"
            description="Install, update, or remove mods effortlessly. Supports Steam Workshop mods, custom uploads, and manages load order automatically — Modix keeps your server modded safely and reliably."
          />
          <FeatureCard
            icon={<FaCogs className="text-orange-400" />}
            title="Server Settings"
            description="Adjust configuration in real-time with an intuitive schema-driven UI. Collapsible categories and validation make misconfigurations nearly impossible."
          />
          <FeatureCard
            icon={<FaLink className="text-cyan-400" />}
            title="Webhook Alerts"
            description="Receive instant notifications for server events, crashes, or player actions through Discord webhooks and automation pipelines."
          />
          <FeatureCard
            icon={<FaShieldAlt className="text-red-500" />}
            title="DDoS Monitor"
            description="Protect your servers with real-time traffic monitoring, alerting on unusual activity or potential attacks."
          />
          <FeatureCard
            icon={<FaChartLine className="text-teal-400" />}
            title="Performance Dashboard"
            description="View live CPU, RAM, network, disk I/O, uptime, and more for all running servers — Modix gives you complete observability."
          />
          <FeatureCard
            icon={<FaBug className="text-rose-400" />}
            title="Mod Debugger"
            description="Automatically detect broken mods, outdated dependencies, or load-order conflicts. Modix provides actionable suggestions to fix issues without downtime."
          />
        </section>

        {/* Action Buttons */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-xl mx-auto">
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

        {/* Community Section */}
        <section className="max-w-lg mx-auto text-sm text-gray-400 space-y-3">
          <p className="text-center font-semibold text-gray-300">
            Need help? Join our support or follow development:
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            <CommunityButton
              href="https://discord.gg/EwWZUSR9tM"
              icon={<FaDiscord />}
              label="Discord"
              className="bg-[#5865f2] hover:bg-[#4752c4]"
            />
            <CommunityButton
              href="https://ko-fi.com/modixgamepanel"
              icon={<FaCoffee />}
              label="Ko-fi"
              className="bg-[#ff5e57] hover:bg-[#e04a46]"
            />
            <CommunityButton
              href="https://www.youtube.com/@modix_panel"
              icon={<FaYoutube />}
              label="YouTube"
              className="bg-[#FF0000] hover:bg-[#cc0000]"
            />
            <CommunityButton
              href="https://steamcommunity.com/sharedfiles/filedetails/?id=3422448677"
              icon={<FaSteam />}
              label="Steam Workshop"
              className="bg-[#171a21] hover:bg-[#0f1114]"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#1e1e1e] rounded-lg p-5 shadow-md hover:shadow-lg transition cursor-default">
      <div className="flex items-center gap-3 mb-3 text-2xl">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
      <p className="text-gray-400 text-sm leading-snug">{description}</p>
    </div>
  );
}

function CommunityButton({
  href,
  icon,
  label,
  className,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-white font-semibold transition ${className}`}
    >
      {icon} <span className="hidden sm:inline">{label}</span>
    </a>
  );
}
