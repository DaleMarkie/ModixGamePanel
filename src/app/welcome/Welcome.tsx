"use client";

import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaCrown, FaDiscord } from "react-icons/fa";

const VERSION = process.env.NEXT_PUBLIC_MODIX_VERSION || "1.1.2";
const BUILD = process.env.NEXT_PUBLIC_MODIX_BUILD || "dev-build";

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="px-2 py-1 rounded-md bg-[#1a1a1a] border border-[#333] text-xs text-gray-400">
    {children}
  </span>
);

export default function InstalledPage() {
  const [hasAccount, setHasAccount] = useState(false);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("modix_local_users") || "[]");
    if (users.length > 0) setHasAccount(true);
  }, []);

  if (hasAccount) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0B0B0B] text-gray-200 px-6">
        <div className="max-w-lg w-full text-center space-y-6">
          <FaCheckCircle className="text-green-500 text-6xl mx-auto" />

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Modix Game Panel Ready
            </h1>
            <p className="text-gray-400 text-sm">
              Your panel has been successfully installed and is ready to use.
            </p>
          </div>

          {/* Version */}
          <div className="flex justify-center gap-2">
            <Badge>Version {VERSION}</Badge>
            <Badge>{BUILD}</Badge>
          </div>

          {/* Login Details */}
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 text-left text-sm space-y-3">
            <p className="text-green-400 font-medium">Login Details</p>

            <div className="bg-[#101010] border border-[#2a2a2a] rounded-md p-3 text-xs text-gray-300 space-y-1">
              <p>
                Username: <strong>owner</strong>
              </p>
              <p>
                Password: <strong>owner</strong>
              </p>
            </div>

            <p className="text-xs text-gray-500">
              Use these credentials to log into your panel.
            </p>
          </div>

          {/* Dev Notice */}
          <div className="bg-[#111] border border-[#2a2a2a] rounded-lg p-4 text-left text-xs text-gray-400 space-y-3">
            <p className="text-yellow-400 font-semibold">
              ⚠ Development Notice
            </p>

            <p>
              Modix is currently in <strong>active development</strong>. Some
              features may be incomplete or change between updates.
            </p>

            <ul className="list-disc list-inside space-y-1">
              <li>UI components still being refined</li>
              <li>Partially implemented systems</li>
              <li>Possible bugs or crashes</li>
              <li>Breaking changes between versions</li>
            </ul>

            <p>
              Running <strong>v{VERSION}</strong> ({BUILD})
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <a
              href="/auth/login"
              className="inline-block w-full py-3 rounded-lg bg-green-600 hover:bg-green-500 transition font-medium text-black"
            >
              Continue to Login
            </a>

            <a
              href="https://discord.gg/SpEeK9Wuyw"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#333] transition text-gray-200"
            >
              <FaDiscord className="text-[#5865F2]" />
              Join Discord Support
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-gray-200 px-6">
      <div className="text-center space-y-4 max-w-md">
        <FaCrown className="text-yellow-500 text-5xl mx-auto" />

        <h1 className="text-xl font-semibold">Setup Required</h1>

        <p className="text-gray-400 text-sm">
          No account found. Continue setup to create your first account.
        </p>

        <div className="text-xs text-gray-500">
          Version {VERSION} • {BUILD}
        </div>

        {/* Discord shortcut here too */}
        <a
          href="https://discord.gg/SpEeK9Wuyw"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 text-sm text-gray-300 hover:text-white transition"
        >
          <FaDiscord className="text-[#5865F2]" />
          Join Discord
        </a>
      </div>
    </main>
  );
}
