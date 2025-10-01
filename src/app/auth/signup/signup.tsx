"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getServerUrl } from "@/app/config";
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
    type: "error" | "success" | "info";
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [masterExists, setMasterExists] = useState(false);

  useEffect(() => {
    // Check if master exists
    fetch(`${getServerUrl()}/api/auth/master_exists`)
      .then((res) => res.json())
      .then((data) => setMasterExists(data.exists))
      .catch(() => setMasterExists(false));
  }, []);

  const resetMessages = () => setMessage(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (!role) throw new Error("Please select an account type first.");
      if (!username || !email || !password)
        throw new Error("All fields are required.");

      if (role === "staff") {
        // Staff account stored locally only
        const staffUser = {
          username,
          email,
          account_type: "staff",
          roles: ["Staff"],
          permissions: [],
          created_at: new Date().toISOString(),
        };

        let localStaff = JSON.parse(
          localStorage.getItem("local_staff") || "[]"
        );
        localStaff.push(staffUser);
        localStorage.setItem("local_staff", JSON.stringify(localStaff));

        setMessage({ text: "✅ Staff user created locally!", type: "success" });
        setTimeout(() => router.push("/auth/login"), 1500);
        return;
      }

      // Master account goes to backend
      if (role === "master" && masterExists) {
        throw new Error("Master account already exists. Signup disabled.");
      }

      const res = await fetch(`${getServerUrl()}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          account_type: "master",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      localStorage.setItem("modix_token", data.token);
      localStorage.setItem("modix_user", JSON.stringify(data.user));

      setMessage({
        text: "✅ Master account created successfully!",
        type: "success",
      });
      setMasterExists(true);
      setTimeout(() => router.push("/auth/myaccount"), 1500);
    } catch (err: any) {
      setMessage({
        text: err.message || "Server error. Try again later.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <h2>Create Account</h2>

      {/* Role selection */}
      <div className="role-selection">
        <div
          className={`role-box ${role === "master" ? "selected" : ""} ${
            masterExists ? "disabled" : ""
          }`}
          onClick={() => !masterExists && setRole("master")}
        >
          <h3>👑 Master Account</h3>
          <p>
            The main owner account. Only one can exist. Controls everything and
            adds staff.
          </p>
          {masterExists && (
            <span className="disabled-text">Already created</span>
          )}
        </div>

        <div
          className={`role-box ${role === "staff" ? "selected" : ""}`}
          onClick={() => setRole("staff")}
        >
          <h3>👥 Staff User</h3>
          <p>
            A local sub-user managed by the master. Permissions are handled
            locally.
          </p>
        </div>
      </div>

      {/* Inputs only show if role selected */}
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
            message.type === "success"
              ? "text-green-400"
              : message.type === "error"
              ? "text-red-400"
              : "text-white"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || (role === "master" && masterExists)}
      >
        {loading
          ? "Processing..."
          : !role
          ? "Select Account Type"
          : role === "master"
          ? "🚀 Create Master Account"
          : "🚀 Create Staff Account"}
      </button>

      <p className="toggle-link">
        <strong onClick={onBack}>🔙 Back to Login</strong>
      </p>

      <p className="support-link">
        Need help? Join our Discord:{" "}
        <a
          href="https://discord.gg/EwWZUSR9tM"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://discord.gg/EwWZUSR9tM
        </a>
      </p>
    </form>
  );
};

export default Signup;
