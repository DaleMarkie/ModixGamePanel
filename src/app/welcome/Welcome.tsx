"use client";

import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaUserShield, FaCrown } from "react-icons/fa";

const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  extraLabel,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  extraLabel?: string;
}) => (
  <div>
    <label className="text-xs text-gray-400">{label}</label>
    {extraLabel && (
      <p className="text-[10px] text-yellow-400 mt-1">{extraLabel}</p>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-lg bg-[#101010] border border-[#333] text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
    />
  </div>
);

const LicenseCard = ({
  keyName,
  title,
  desc,
  icon,
  selected,
  disabled,
  onClick,
}: {
  keyName: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) => (
  <div
    onClick={disabled ? undefined : onClick}
    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col gap-1
      ${disabled ? "border-[#333] opacity-50 cursor-not-allowed" : ""}
      ${
        selected
          ? "border-green-500 bg-green-950/30 shadow-lg scale-[1.02]"
          : "border-[#333] hover:border-green-500 hover:bg-[#222]"
      }`}
  >
    <div className="flex items-center gap-2 text-sm">
      {icon}
      <h3 className="font-semibold">{title}</h3>
    </div>
    <p className="text-gray-400 text-xs">{desc}</p>
  </div>
);

export default function InstalledPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [licensePlan, setLicensePlan] = useState<"personal" | "host">(
    "personal"
  );
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success" | "info";
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [masterCreated, setMasterCreated] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("modix_local_users") || "[]");
    if (users.some((u: any) => u.role === "Owner")) setMasterCreated(true);
  }, []);

  const handleCreateMaster = () => {
    setMessage(null);

    if (!username || !password || !confirmPassword)
      return setMessage({ text: "All fields are required.", type: "error" });

    if (password !== confirmPassword)
      return setMessage({ text: "Passwords do not match.", type: "error" });

    setLoading(true);
    try {
      const users = JSON.parse(
        localStorage.getItem("modix_local_users") || "[]"
      );
      if (users.some((u: any) => u.role === "Owner")) {
        setMessage({ text: "Master account already exists.", type: "error" });
        return;
      }

      users.push({ username, password, role: "Owner", licensePlan });
      localStorage.setItem("modix_local_users", JSON.stringify(users));

      setMessage({ text: "Master account created!", type: "success" });
      setTimeout(() => (window.location.href = "/auth/login"), 1200);
    } catch {
      setMessage({ text: "Failed to create account.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (masterCreated)
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0D0D0D] text-gray-200 px-6">
        <div className="text-center space-y-3 max-w-md">
          <FaCheckCircle className="text-green-500 text-6xl mx-auto" />
          <h1 className="text-2xl font-bold">Master Already Created</h1>
          <p className="text-sm text-gray-400">
            If you are getting this error, you should contact your server
            administrator for help.
          </p>
          <a
            href="/auth/login"
            className="text-green-400 hover:text-green-300 transition underline"
          >
            Go to Login
          </a>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-gray-200 px-6 relative">
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-[0.15] blur-xl pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 10%, rgba(20,200,130,0.2), transparent 60%),
            radial-gradient(circle at 90% 85%, rgba(255,210,30,0.15), transparent 75%)
          `,
        }}
      />

      <div className="relative w-full max-w-2xl bg-[#151515] rounded-2xl shadow-xl p-8 space-y-7 border border-[#222]">
        {/* Header */}
        <div className="text-center space-y-2">
          <FaUserShield className="text-green-500 text-4xl mx-auto" />
          <h1 className="text-3xl font-bold tracking-tight">
            Create Master Account
          </h1>
          <p className="text-[13px] text-gray-400">
            Final setup before accessing Modix
          </p>
          <span className="inline-block px-3 py-1 bg-green-600 text-black rounded-full text-xs font-semibold">
            v1.1.2 — Setup
          </span>
        </div>

        {/* Warning */}
        <div className="bg-[#2b2b18] border border-yellow-500/40 px-4 py-3 rounded-lg text-sm text-yellow-300">
          <strong>⚠ IMPORTANT:</strong> Password cannot be recovered. Use a
          strong and unique one.
        </div>

        {/* License Selection */}
        <div className="grid grid-cols-2 gap-4">
          <LicenseCard
            keyName="personal"
            title="Personal"
            desc="Free for personal use"
            icon={<FaCheckCircle />}
            selected={licensePlan === "personal"}
            onClick={() => setLicensePlan("personal")}
          />
          <LicenseCard
            keyName="host"
            title="Hosting"
            desc="For hosting providers"
            icon={<FaCrown />}
            selected={false}
            disabled
            onClick={() =>
              setMessage({
                text: "Hosting license is not available yet.",
                type: "info",
              })
            }
          />
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          <InputField
            label="Username"
            value={username}
            onChange={setUsername}
          />
          <InputField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            extraLabel="Use a new password just for Modix Game Panel. Do not use your usual password."
          />
          <InputField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
        </div>

        {/* Message */}
        {message && (
          <p
            className={`text-center text-sm font-semibold ${
              message.type === "error"
                ? "text-red-500"
                : message.type === "success"
                ? "text-green-400"
                : "text-gray-300"
            }`}
          >
            {message.text}
          </p>
        )}

        {/* CTA Button */}
        <button
          onClick={() => setShowTerms(true)}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 active:scale-95 transition font-bold text-black shadow-lg"
        >
          🛡️ Next – Terms of Use
        </button>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/75 z-50">
          <div className="bg-[#1e1e1e] text-white w-[600px] p-8 rounded-xl shadow-2xl border border-[#333]">
            <h2 className="text-xl font-bold mb-4 text-center">
              Terms & Conditions
            </h2>

            <div className="h-[280px] overflow-y-auto border border-[#333] rounded-lg p-4 text-sm leading-relaxed space-y-2">
              <p>
                💖 <strong>Support & Donations</strong>
                <br />
                All donations go directly toward maintaining and improving
                Modix. If you’d like to support development, visit: 👉{" "}
                <a
                  href="https://ko-fi.com/modixgamepanel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-green-400"
                >
                  https://ko-fi.com/modixgamepanel
                </a>
              </p>
              <p>
                ⚖️ <strong>License & Terms of Use</strong> 🧑‍💻 Modix Game Panel
                Non-Commercial License (NC) – Version 1.4
              </p>
              <p>
                Copyright (c) 2025 Ov3rlord (Dale Markie) & the Modix Dev Team
                <br />
                All components of Modix — including source code, API code, UI,
                backend, frontend, and assets — are the exclusive property of
                Ov3rlord (Dale Markie) and the Modix Dev Team. You are free to
                use, modify, and contribute to Modix for personal, educational,
                or community use, but not for commercial purposes.
              </p>
              <p>
                <strong>✅ You May</strong>
                <br />
                Use Modix locally for personal or educational projects
                <br />
                Modify and build upon Modix for non-commercial purposes
                <br />
                Share improvements or extensions for community benefit
              </p>
              <p>
                <strong>🚫 You May NOT</strong>
                <br />
                Copy or reupload Modix or its components elsewhere
                <br />
                Sell, rent, or license the core Modix Software
                <br />
                Use any Modix UI, assets, or frontend code in other software or
                websites
                <br />
                Use Modix for cheating, exploiting, or any illegal activity
                <br />
                Claim ownership or remove attribution
              </p>
              <p>
                <strong>🔌 Add-ons and Extensions</strong>
                <br />
                Users may create and sell verified add-ons or extensions only
                after approval from the Modix Dev Team via our official Discord:
                👉{" "}
                <a
                  href="https://discord.gg/EwWZUSR9tM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-green-400"
                >
                  https://discord.gg/EwWZUSR9tM
                </a>
                <br />
                Any unverified or unauthorized sale is strictly prohibited.
                <br />
                The Modix Dev Team may revoke verification for any violations.
              </p>
              <p>
                <strong>⚖️ Other Terms</strong>
                <br />
                License updates may occur; users must follow the latest version.
                <br />
                Violations immediately terminate your rights to use Modix.
                <br />
                Governed by the laws of the United Kingdom.
                <br />
                By using or modifying Modix Game Panel, you agree to all the
                above terms. The software remains open source for the community
                but ownership stays with Ov3rlord (Dale Markie) and the Modix
                Dev Team.
              </p>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowTerms(false)}
                className="w-[48%] py-2.5 bg-[#252525] hover:bg-[#2e2e2e] rounded-lg transition"
              >
                Decline
              </button>
              <button
                onClick={() => {
                  setShowTerms(false);
                  handleCreateMaster();
                }}
                className="w-[48%] py-2.5 bg-[#3a86ff] hover:bg-[#336fd8] rounded-lg transition"
              >
                Accept & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
