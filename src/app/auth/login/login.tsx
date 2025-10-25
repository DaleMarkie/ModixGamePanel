"use client";

import { useState, useEffect, useRef } from "react";
import Signup from "../signup/signup";
import { recordLogin } from "../activity/Activity"; // ⬅️ added import
import "./login.css";

const LOCAL_USERS_KEY = "modix_local_users";
const SESSION_KEY = "modix_active_session";

interface LocalUser {
  username: string;
  password: string;
  role?: "Owner" | "Admin" | "SubUser";
  email?: string;
  createdAt?: string;
  lastLogin?: string;
}

// ---------------------------
// LocalStorage Helpers
// ---------------------------
const getLocalUsers = (): LocalUser[] => {
  const data = localStorage.getItem(LOCAL_USERS_KEY);
  if (!data) {
    const testUsers: LocalUser[] = [
      { username: "admin", password: "admin123", role: "Owner" },
      { username: "subuser", password: "pass123", role: "SubUser" },
    ];
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(testUsers));
    return testUsers;
  }
  return JSON.parse(data);
};

const saveLocalUsers = (users: LocalUser[]) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

// ---------------------------
// Component
// ---------------------------
export default function Login() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const lastUser = localStorage.getItem("modix_last_username");
    if (lastUser) setUsername(lastUser);
    usernameRef.current?.focus();
  }, []);

  const resetMessage = () => setMessage(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessage();
    setLoading(true);

    setTimeout(() => {
      try {
        if (!username || !password) throw new Error("All fields are required.");

        const users = getLocalUsers();
        const user = users.find((u) => u.username === username);

        if (!user) throw new Error("User not found.");
        if (user.password !== password) throw new Error("Incorrect password.");

        // Update timestamps
        user.lastLogin = new Date().toISOString();
        saveLocalUsers(users);

        // Save session
        localStorage.setItem("modix_user", JSON.stringify(user));
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ username: user.username, startTime: Date.now() })
        );

        // 🔥 Record login
        recordLogin(user.username);

        if (rememberMe)
          localStorage.setItem("modix_last_username", user.username);
        else localStorage.removeItem("modix_last_username");

        setMessage({
          text: `Welcome ${user.username}! Redirecting...`,
          type: "success",
        });

        setTimeout(() => (window.location.href = "/auth/myaccount"), 800);
      } catch (err: any) {
        setMessage({ text: err.message, type: "error" });
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="login-background">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>🔐 Local Login</h2>

        <input
          ref={usernameRef}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <label className="remember-me">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember Me
        </label>

        {message && <p className={`message ${message.type}`}>{message.text}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Checking..." : "🚀 Log In"}
        </button>
      </form>
    </div>
  );
}
