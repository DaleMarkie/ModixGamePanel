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

      {/* Warning Banner */}
      <div className="relative z-10 max-w-3xl mx-auto bg-yellow-900 bg-opacity-90 border border-yellow-600 rounded-lg p-5 mb-6 flex items-start gap-4 shadow-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-yellow-400 flex-shrink-0 mt-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.68-3.02L13.7 7a2 2 0 00-3.4 0L3.4 15.98A2 2 0 005.07 19z"
          />
        </svg>
        <p className="text-yellow-100 text-left text-sm md:text-base leading-relaxed font-semibold">
          ⚠️ <span className="underline">Warning:</span> You are using an{" "}
          <em>unstable</em> release (v1.1.2) of Modix. We strongly recommend
          running it only on a <strong>test server</strong> or development
          environment. This version may contain bugs, glitches, or unexpected
          issues as we continue refining the platform.
          <br />
          <br />
          Your feedback is invaluable — if you encounter any problems, please
          report them on our Discord community. Thank you for supporting Modix
          and helping us improve!
          <br />
          <br />
          Enjoy exploring Modix,
          <br />
          The Modix Team
        </p>
      </div>

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
            description="Stream logs and run commands in real-time inside your Dockerized server container."
          />
          <FeatureCard
            icon={<FaFolderOpen className="text-yellow-400" />}
            title="File Manager"
            description="Upload, edit, delete or browse all files — instantly connected to your server’s filesystem."
          />
          <FeatureCard
            icon={<FaUsers className="text-blue-400" />}
            title="Player Manager"
            description="Track and manage connected players. Kick, ban, or view Steam profiles directly."
          />
          <FeatureCard
            icon={<FaPuzzlePiece className="text-pink-400" />}
            title="Mod & Workshop Manager"
            description="Install, remove, or reorder mods. Full support for Steam Workshop and custom uploads."
          />
          <FeatureCard
            icon={<FaCogs className="text-orange-400" />}
            title="Server Settings"
            description="Adjust your config via a powerful live schema UI with collapsible categories and validation."
          />
          <FeatureCard
            icon={<FaLink className="text-cyan-400" />}
            title="Webhook Alerts"
            description="Get real-time alerts for crashes, events, or bans via Discord webhooks and automation."
          />
          <FeatureCard
            icon={<FaShieldAlt className="text-red-500" />}
            title="DDoS Monitor"
            description="Track unusual inbound traffic and potential attacks with real-time server protection stats."
          />
          <FeatureCard
            icon={<FaChartLine className="text-teal-400" />}
            title="Performance Dashboard"
            description="Live stats on CPU, RAM, network, I/O, uptime and more — across all running containers."
          />
          <FeatureCard
            icon={<FaBug className="text-rose-400" />}
            title="Mod Debugger"
            description="See broken mods, outdated dependencies, or load-order conflicts. Auto-suggest fixes."
          />
          <FeatureCard
            icon={<SiDocker className="text-blue-400" />}
            title="Docker-Powered Infrastructure"
            description="Modix runs natively inside Docker, ensuring isolated, portable environments for each game server with robust container lifecycle control."
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

        {/* Upcoming Features Section */}
        <section className="max-w-3xl mx-auto bg-gradient-to-br from-gray-850 to-gray-900 rounded-xl p-10 shadow-md border border-gray-700">
          <h2 className="text-5xl font-bold text-white mb-6 tracking-tight">
            Modix Changelog
          </h2>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed font-medium">
            Stay up to date with the latest improvements, fixes, and new
            features. We’re always working to make Modix better — here’s what’s
            new:
          </p>

          <ul className="space-y-5">
            {["test"].map((item, idx) => (
              <li key={idx} className="flex items-start gap-4 text-gray-400">
                <svg
                  className="w-6 h-6 mt-1 flex-shrink-0 text-cyan-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-md font-semibold leading-snug">
                  {item}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-sm italic text-gray-500 max-w-md mx-auto text-center">
            Stay tuned and join our{" "}
            <a
              href="https://discord.gg/EwWZUSR9tM"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              Discord
            </a>{" "}
            to give feedback and test beta features!
          </p>
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
