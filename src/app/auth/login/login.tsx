"use client";

import { useState, useEffect, useRef } from "react";
import "./login.css";
import { recordLogin } from "../activity/Activity";

const LOCAL_USERS_KEY = "modix_local_users";
const SESSION_KEY = "modix_aactive_session";

interface LocalUser {
  username: string;
  password: string;
  role?: "Owner" | "Admin" | "SubUser";
  roles?: string[];
  lastLogin?: string;
}

const getLocalUsers = (): LocalUser[] => {
  const data = localStorage.getItem(LOCAL_USERS_KEY);
  if (!data) {
    const testUsers: LocalUser[] = [
      { username: "owner", password: "owner", role: "Owner", roles: ["Owner"] },
      {
        username: "admin",
        password: "admin123",
        role: "Admin",
        roles: ["Admin"],
      },
      {
        username: "subuser1",
        password: "password1",
        role: "SubUser",
        roles: ["SubUser"],
      },
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
  const [acceptLicense, setAcceptLicense] = useState(false);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessage();

    if (!acceptLicense) {
      setMessage({
        text: "You must accept the Modix License to log in.",
        type: "error",
      });
      return;
    }
    if (!username || !password) {
      setMessage({ text: "All fields are required.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("Invalid username or password");

      const data = await res.json();
      const user: LocalUser = data.user;

      user.roles = user.roles || [user.role || "SubUser"];
      user.lastLogin = new Date().toISOString();

      localStorage.setItem("modix_user", JSON.stringify(user));
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ username: user.username, startTime: Date.now() })
      );
      recordLogin(user.username);

      if (rememberMe)
        localStorage.setItem("modix_last_username", user.username);
      else localStorage.removeItem("modix_last_username");

      setMessage({
        text: `Welcome ${user.username}! Redirecting...`,
        type: "success",
      });
      setTimeout(() => (window.location.href = "/auth/myaccount"), 800);
    } catch {
      // fallback: localStorage login
      const users = getLocalUsers();
      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (!user) {
        setMessage({ text: "Invalid username or password", type: "error" });
      } else {
        user.roles = user.roles || [user.role || "SubUser"];
        user.lastLogin = new Date().toISOString();
        saveLocalUsers(users);

        localStorage.setItem("modix_user", JSON.stringify(user));
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ username: user.username, startTime: Date.now() })
        );
        recordLogin(user.username);

        if (rememberMe)
          localStorage.setItem("modix_last_username", user.username);
        else localStorage.removeItem("modix_last_username");

        setMessage({
          text: `Welcome ${user.username}! Redirecting...`,
          type: "success",
        });
        setTimeout(() => (window.location.href = "/auth/myaccount"), 800);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2 className="login-title">🔐 Local Login</h2>

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

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={acceptLicense}
            onChange={(e) => setAcceptLicense(e.target.checked)}
          />
          I accept the <strong>Modix License & Terms of Use</strong>
        </label>

        {message && <p className={`message ${message.type}`}>{message.text}</p>}

        <button type="submit" disabled={loading} className="login-button">
          {loading ? "Checking..." : "🚀 Log In"}
        </button>
      </form>
    </div>
  );
}
