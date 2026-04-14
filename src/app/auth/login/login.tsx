"use client";

import { useState, useEffect, useRef } from "react";
import "./login.css";
import { recordLogin } from "../activity/Activity";

const LOCAL_USERS_KEY = "modix_local_users";
const SESSION_KEY = "modix_active_session";

interface LocalUser {
  username: string;
  password: string;
  role?: "Owner" | "Admin" | "SubUser";
  roles?: string[];
  lastLogin?: string;
}

// 🔐 Hash helper (matches setup page)
const hashPassword = async (password: string) => {
  const enc = new TextEncoder().encode(password);
  const buffer = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const getLocalUsers = (): LocalUser[] => {
  const data = localStorage.getItem(LOCAL_USERS_KEY);
  if (!data) {
    const testUsers: LocalUser[] = [
      { username: "owner", password: "owner", role: "Owner", roles: ["Owner"] },
    ];
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(testUsers));
    return testUsers;
  }
  return JSON.parse(data);
};

const saveLocalUsers = (users: LocalUser[]) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:2010";

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

  const setError = (text: string) => setMessage({ text, type: "error" });
  const setSuccess = (text: string) => setMessage({ text, type: "success" });

  const completeLogin = (user: LocalUser) => {
    user.roles = user.roles || [user.role || "SubUser"];
    user.lastLogin = new Date().toISOString();

    localStorage.setItem("modix_user", JSON.stringify(user));
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ username: user.username, startTime: Date.now() })
    );

    recordLogin(user.username);

    if (rememberMe) {
      localStorage.setItem("modix_last_username", user.username);
    } else {
      localStorage.removeItem("modix_last_username");
    }

    setSuccess(`Welcome ${user.username}! Redirecting...`);
    setTimeout(() => (window.location.href = "/auth/myaccount"), 800);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!username || !password) return setError("All fields are required.");

    setLoading(true);

    try {
      // 🌐 Backend login first
      const res = await fetch(`${BACKEND_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      completeLogin(data.user);
    } catch {
      // 💾 Fallback local login (hashed support)
      const users = getLocalUsers();
      const hashed = await hashPassword(password);

      const user = users.find(
        (u) =>
          u.username === username &&
          (u.password === password || u.password === hashed)
      );

      if (!user) {
        setError("Invalid username or password");
      } else {
        saveLocalUsers(users);
        completeLogin(user);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2 className="login-title">🔐 Panel Login</h2>

        <div className="login-info-box">
          <p>
            Default login: <strong>owner / owner</strong>
          </p>
          <p className="warning-text">
            ⚠ Log in with the username and password you created when setting up
            Modix.
          </p>
        </div>

        <input
          ref={usernameRef}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember Me
        </label>

        {message && <p className={`message ${message.type}`}>{message.text}</p>}

        <button type="submit" disabled={loading} className="login-button">
          {loading ? "Checking..." : "🚀 Log In"}
        </button>
      </form>
    </div>
  );
}
