"use client";

import React, { useState } from "react";
import { getServerUrl } from "@/app/config";

interface MySettingsProps {
  user: any;
  setUser: (user: any) => void;
}

const MySettings: React.FC<MySettingsProps> = ({ user, setUser }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const SERVER_URL = getServerUrl();

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const token = localStorage.getItem("modix_token");

    try {
      const response = await fetch(`${SERVER_URL}/api/auth/update-account`, {
        method: "POST",
        headers: {
          Authorization: token || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_username: newUsername || undefined,
          new_password: newPassword || undefined,
          new_email: newEmail || undefined,
          security_question: securityQuestion || undefined,
          security_answer: securityAnswer || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        localStorage.setItem("modix_user", JSON.stringify(updatedUser));
        setMessage("✅ Account updated successfully");
      } else {
        setMessage(data.message || "❌ Error updating account");
      }
    } catch {
      setMessage("❌ Could not connect to server");
    }

    setLoading(false);
  };

  return (
    <section className="p-6 max-w-md mx-auto bg-gradient-to-b from-black via-gray-900 to-gray-800 rounded-xl space-y-6 shadow-lg border border-gray-700">
      <h3 className="text-2xl font-bold text-white">⚙️ Account Settings</h3>

      <form className="space-y-4" onSubmit={handleUpdateAccount}>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Current Password"
          required
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />

        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          placeholder={user?.username || ""}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />

        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />

        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder={user?.email || ""}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />

        <input
          type="text"
          value={securityQuestion}
          onChange={(e) => setSecurityQuestion(e.target.value)}
          placeholder="Security Question"
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />

        <input
          type="text"
          value={securityAnswer}
          onChange={(e) => setSecurityAnswer(e.target.value)}
          placeholder="Security Answer"
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />

        {message && (
          <div
            className={`text-sm font-medium ${
              message.startsWith("✅") ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-800 hover:bg-green-700 text-white p-3 rounded-lg font-bold transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Updating..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
};

export default MySettings;
