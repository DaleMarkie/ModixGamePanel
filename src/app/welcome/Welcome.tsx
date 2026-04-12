"use client";

import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaUserShield, FaCrown } from "react-icons/fa";

// 👉 You can later replace these with env vars
const VERSION = process.env.NEXT_PUBLIC_MODIX_VERSION || "1.1.2";
const BUILD = process.env.NEXT_PUBLIC_MODIX_BUILD || "dev-build";

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
    onClick={() => {
      if (disabled) {
        onClick();
        return;
      }
      onClick();
    }}
    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col gap-1
      ${disabled ? "border-[#333] opacity-50" : ""}
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
    if (users.some((u: any) => u.role?.toLowerCase() === "owner"))
      setMasterCreated(true);
  }, []);

  const validateForm = () => {
    if (!username || !password || !confirmPassword) {
      setMessage({ text: "All fields are required.", type: "error" });
      return false;
    }

    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return false;
    }

    return true;
  };

  const handleCreateMaster = async () => {
    if (loading) return;

    setMessage(null);
    setLoading(true);

    try {
      const users = JSON.parse(
        localStorage.getItem("modix_local_users") || "[]"
      );

      if (users.some((u: any) => u.role?.toLowerCase() === "owner")) {
        setMessage({ text: "Master account already exists.", type: "error" });
        setLoading(false);
        return;
      }

      const enc = new TextEncoder().encode(password);
      const buffer = await crypto.subtle.digest("SHA-256", enc);
      const hashed = Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      users.push({ username, password: hashed, role: "Owner", licensePlan });
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
        <div className="text-center space-y-4 max-w-md">
          <FaCheckCircle className="text-green-500 text-6xl mx-auto" />
          <h1 className="text-2xl font-bold">Master Already Created</h1>

          {/* Version Info */}
          <div className="text-xs text-gray-500">
            Version {VERSION} • Build {BUILD}
          </div>

          <div className="text-sm text-gray-400 space-y-3">
            <p>
              A master (Owner) account has already been set up for this Modix
              instance.
            </p>

            <p>
              If you did not create this account or cannot log in, please contac
              the person who deployed this panel or Modix Support on discord for
              any more help.
            </p>

            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-left text-xs space-y-2">
              <p className="text-yellow-400 font-semibold">
                ⚠ Development Notice
              </p>
              <p>
                Modix is currently in <strong>active development</strong>. Some
                features may be incomplete, unstable, or change between updates.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>UI components still being refined</li>
                <li>Partially implemented systems</li>
                <li>Possible bugs or crashes</li>
                <li>Breaking changes between versions</li>
              </ul>
              <p>
                You are currently running <strong>v{VERSION}</strong> ({BUILD}).
              </p>
            </div>

            <p>
              If something appears broken, it may already be in progress. Check
              for updates or reinstall if needed.
            </p>
          </div>

          <a
            href="/auth/login"
            className="inline-block mt-2 text-green-400 hover:text-green-300 transition underline"
          >
            Go to Login
          </a>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-gray-200 px-6">
      <div className="text-center text-gray-500">Setup continues here...</div>
    </main>
  );
}
