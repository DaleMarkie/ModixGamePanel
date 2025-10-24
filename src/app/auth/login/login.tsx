"use client";

import { useState, useEffect, useRef } from "react";
import Signup from "../signup/signup";
import "./login.css";

const LOCAL_USERS_KEY = "modix_local_users";

interface LocalUser {
  username: string;
  password: string; // plaintext for simplicity; can later hash
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
    // pre-populate with test users
    const testUsers: LocalUser[] = [
      {
        username: "testuser",
        password: "test1234",
        role: "Owner",
        email: "test@example.com",
        createdAt: new Date().toISOString(),
      },
      {
        username: "admin",
        password: "admin123",
        role: "Admin",
        email: "admin@example.com",
        createdAt: new Date().toISOString(),
      },
      {
        username: "subuser1",
        password: "password1",
        role: "SubUser",
        email: "sub1@example.com",
        createdAt: new Date().toISOString(),
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

const saveLocalUser = (user: LocalUser) => {
  const users = getLocalUsers();
  users.push(user);
  saveLocalUsers(users);
};

// ---------------------------
// Component
// ---------------------------
const Login = () => {
  const usernameRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"login" | "signup" | "recover">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success" | "info";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const lastUser = localStorage.getItem("modix_last_username");
    if (lastUser) setUsername(lastUser);
    usernameRef.current?.focus();
  }, []);

  const resetMessages = () => setMessage(null);

  // ---------------------------
  // Login Handler
  // ---------------------------
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    setTimeout(() => {
      try {
        if (!username || !password) throw new Error("All fields are required.");

        const users = getLocalUsers();
        const user = users.find((u) => u.username === username);

        if (!user) throw new Error("User not found.");
        if (user.password !== password) throw new Error("Incorrect password.");

        // Update lastLogin timestamp
        user.lastLogin = new Date().toISOString();
        saveLocalUsers(users);

        localStorage.setItem("modix_user", JSON.stringify(user));
        if (rememberMe) localStorage.setItem("modix_last_username", username);
        else localStorage.removeItem("modix_last_username");

        setMessage({
          text: `Login successful! Welcome ${user.username}`,
          type: "success",
        });
        setTimeout(() => (window.location.href = "/auth/myaccount"), 500);
      } catch (err: any) {
        setMessage({ text: err.message, type: "error" });
      } finally {
        setLoading(false);
      }
    }, 300); // simulate network delay
  };

  // ---------------------------
  // Signup Handler
  // ---------------------------
  const handleSignup = (
    username: string,
    password: string,
    role: "Owner" | "Admin" | "SubUser" = "SubUser"
  ) => {
    resetMessages();
    const users = getLocalUsers();
    if (users.find((u) => u.username === username)) {
      setMessage({ text: "Username already exists.", type: "error" });
      return;
    }

    const newUser: LocalUser = {
      username,
      password,
      role,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };
    saveLocalUser(newUser);
    setMessage({
      text: `User ${username} registered successfully!`,
      type: "success",
    });
    setMode("login");
  };

  return (
    <div className="login-background">
      {mode === "signup" ? (
        <Signup onBack={() => setMode("login")} onSignup={handleSignup} />
      ) : (
        <form className="login-form" onSubmit={handleLogin}>
          <h2>{mode === "recover" ? "Recover Account" : "Sign In"}</h2>

          <input
            ref={usernameRef}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          {mode !== "recover" && (
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
          )}

          {mode === "login" && (
            <div className="remember-me">
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark" /> Remember Me
              </label>
            </div>
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

          <button type="submit" disabled={loading}>
            {loading
              ? "Processing..."
              : mode === "recover"
              ? "Send Recovery Email"
              : "🚀 Log In"}
          </button>

          <p className="toggle-link">
            <strong
              onClick={() => {
                resetMessages();
                setMode("signup");
              }}
            >
              Master Sign Up
            </strong>{" "}
            |{" "}
            {mode !== "recover" && (
              <strong
                onClick={() => {
                  resetMessages();
                  setMode("recover");
                }}
              >
                Recover Account
              </strong>
            )}
          </p>
        </form>
      )}
    </div>
  );
};

export default Login;
