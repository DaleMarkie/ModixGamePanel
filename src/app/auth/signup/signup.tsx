"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./signup.css";

interface SignupProps {
  onBack: () => void;
}

const Signup: React.FC<SignupProps> = ({ onBack }) => {
  const router = useRouter();
  const [role, setRole] = useState<"master" | "staff" | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);

  const resetMessages = () => setMessage(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!role)
      return setMessage({ text: "Select account type first.", type: "error" });
    if (!username || !email || !password)
      return setMessage({ text: "All fields are required.", type: "error" });

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Signup failed");
      setMessage({ text: "✅ Account created successfully!", type: "success" });
      setTimeout(() => router.push("/auth/login"), 1000);
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <h2>Create Account</h2>
      <div className="role-selection">
        <div
          className={`role-box ${role === "master" ? "selected" : ""}`}
          onClick={() => setRole("master")}
        >
          <h3>👑 Master Account</h3>
          <p>Main admin account. Full permissions.</p>
        </div>
        <div
          className={`role-box ${role === "staff" ? "selected" : ""}`}
          onClick={() => setRole("staff")}
        >
          <h3>👥 Staff User</h3>
          <p>Sub-user with limited permissions.</p>
        </div>
      </div>

      {role && (
        <>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>
        </>
      )}

      {message && (
        <div
          className={`message ${
            message.type === "success" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}
      <button type="submit">
        {role ? "🚀 Create Account" : "Select Account Type"}
      </button>
      <p className="toggle-link">
        <strong onClick={onBack}>🔙 Back to Login</strong>
      </p>
    </form>
  );
};

export default Signup;
