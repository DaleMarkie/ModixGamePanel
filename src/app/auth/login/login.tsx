"use client";

import React, { useState } from "react";
import "./login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const params = new URLSearchParams();
      params.append("grant_type", "password");
      params.append("username", username);
      params.append("password", password);
      params.append("scope", "");
      params.append("client_id", "string");
      params.append("client_secret", "********");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
        body: params.toString(),
      });

      const result: { token?: string; message?: string } =
        await response.json();

      if (response.ok) {
        if (result.token) {
          localStorage.setItem("token", result.token);
        }
        window.location.href = "/auth/myaccount";
      } else {
        setError(result.message || "Invalid username or password.");
      }
    } catch {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="container">
      <aside className="left-panel">
        <div className="logo">v1.1.2</div>
        <h1 className="welcome-title">Modix Game Panel</h1>
        <p className="welcome-subtitle">
          <strong>Effortless Server Management. Free Forever.</strong>
          <br />
          <br />
          Modix is a full-featured panel built for gamers, modders, and server
          admins.
          <br />
          <br />
          Spin up, manage, and monitor your game servers with real-time
          insights, seamless automation, and intuitive controls and no technical
          skills needed.
          <br />
          <br />
          Start for free, no credit card required.
        </p>
        <div className="illustration" aria-hidden="true">
          🎮
        </div>
      </aside>

      <main className="right-panel" role="main" aria-label="Login form">
        <form onSubmit={handleLogin} className="login-form" noValidate>
          <h2 className="form-title">Sign In</h2>

          {/* Demo credentials note */}
          <div className="demo-credentials">
            <span className="label">💡 Demo credentials:</span>
            <span className="values">
              Username: <strong>test1</strong>, Password: <strong>test1</strong>
            </span>
          </div>

          <label htmlFor="username" className="input-label">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
            required
            autoComplete="username"
            className="input-field"
          />

          <label htmlFor="password" className="input-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
            autoComplete="current-password"
            className="input-field"
          />

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-login">
            🚀 Log In
          </button>

          <footer className="footer">Modix Game Panel &copy; 2025</footer>
        </form>
      </main>
    </div>
  );
};

export default Login;
