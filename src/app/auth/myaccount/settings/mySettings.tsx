"use client";

import React, { useState, useEffect } from "react";
import { getServerUrl } from "@/app/config";
import { FaCheck, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";

interface MySettingsProps {
  user: any;
  setUser: (user: any) => void;
}

const MySettings: React.FC<MySettingsProps> = ({ user, setUser }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const SERVER_URL = getServerUrl();

  // Password strength calculation
  useEffect(() => {
    let strength = 0;
    if (newPassword.length >= 6) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[\W]/.test(newPassword)) strength++;
    setPasswordStrength(strength);
  }, [newPassword]);

  // Simulated username availability
  useEffect(() => {
    if (!newUsername) return setUsernameAvailable(null);
    const timeout = setTimeout(
      () => setUsernameAvailable(Math.random() > 0.3),
      500
    );
    return () => clearTimeout(timeout);
  }, [newUsername]);

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-yellow-400";
      case 3:
        return "bg-green-400";
      case 4:
        return "bg-green-600";
      default:
        return "bg-gray-700";
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const token = localStorage.getItem("modix_token");

    try {
      const res = await fetch(`${SERVER_URL}/api/auth/update-account`, {
        method: "POST",
        headers: {
          Authorization: token || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword || undefined,
          new_username: newUsername || undefined,
        }),
      });
      const data = await res.json();

      if (data.success) {
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        localStorage.setItem("modix_user", JSON.stringify(updatedUser));
        setMessage("✅ Account updated successfully");
        setOldPassword("");
        setNewPassword("");
        setNewUsername("");
        setPasswordStrength(0);
        setUsernameAvailable(null);
      } else {
        setMessage(data.message || "❌ Error updating account");
      }
    } catch {
      setMessage("❌ Could not connect to server");
    }

    setLoading(false);
    setTimeout(() => setMessage(""), 4000); // Auto fade out message
  };

  return (
    <section className="max-w-3xl mx-auto bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl p-6 space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-extrabold text-green-400">
          Account Settings
        </h2>
        <p className="text-gray-400 text-sm">
          Securely update your username and password
        </p>
      </div>

      <form
        onSubmit={handleUpdate}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Old Password */}
        <div className="relative">
          <input
            type={passwordVisible ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Current Password"
            required
            className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
          <label className="absolute left-4 top-2 text-gray-400 text-sm pointer-events-none transition-all">
            Current Password
          </label>
          <span
            className="absolute right-4 top-4 cursor-pointer text-gray-400"
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* New Password */}
        <div className="relative">
          <input
            type={passwordVisible ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
          <label className="absolute left-4 top-2 text-gray-400 text-sm pointer-events-none transition-all">
            New Password
          </label>
          {/* Password strength */}
          {newPassword && (
            <div className="absolute bottom-1 left-1 w-[calc(100%-0.5rem)] h-2 bg-gray-800 rounded overflow-hidden">
              <div
                className={`h-full rounded ${getStrengthColor()} transition-all duration-300`}
                style={{ width: `${(passwordStrength / 4) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* New Username */}
        <div className="relative md:col-span-2">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="New Username"
            className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-green-500 transition pr-10"
          />
          <label className="absolute left-4 top-2 text-gray-400 text-sm pointer-events-none transition-all">
            New Username
          </label>
          {usernameAvailable !== null && (
            <span className="absolute right-4 top-4">
              {usernameAvailable ? (
                <FaCheck
                  className="text-green-400"
                  title="Username available"
                />
              ) : (
                <FaTimes className="text-red-500" title="Username taken" />
              )}
            </span>
          )}
        </div>

        {/* Message */}
        {message && (
          <div
            className={`md:col-span-2 p-3 rounded-xl text-center text-sm font-medium ${
              message.startsWith("✅")
                ? "bg-green-950 text-green-400"
                : "bg-red-950 text-red-500"
            } transition-opacity`}
          >
            {message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Updating..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
};

export default MySettings;
