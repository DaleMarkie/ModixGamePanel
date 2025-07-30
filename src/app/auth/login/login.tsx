"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ForgotPasswordModal from "../ForgotPasswordModal";
import "./login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const router = useRouter();

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

      const result = await response.json();
      console.log("[LOGIN DEBUG] Backend response:", result);

      if (response.ok) {
        if (result.token) {
          localStorage.setItem("token", result.token);
        }

        // ✅ Hard reload after token is stored to make sure auth state is picked up
        window.location.href = "/auth/myaccount";
      } else {
        setError(result.message || "Invalid username or password.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">🔐 Login to Modix Panel</h1>

        <form onSubmit={handleLogin} className="login-form">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-button">
            🚀 Login
          </button>

          <div className="login-extra">
            <button
              type="button"
              className="forgot-password"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot password?
            </button>
          </div>
        </form>

        <div className="signup-section">
          <p>Don't have an account?</p>
          <button className="signup-button" onClick={handleSignUp}>
            📝 Sign Up
          </button>
        </div>

        <div className="social-login">
          <p className="social-text">Or login with</p>
          <div className="social-buttons">
            <button className="social-btn discord">Discord</button>
            <button className="social-btn steam">Steam</button>
            <button className="social-btn facebook">Facebook</button>
          </div>
        </div>

        <p className="login-footer">Modix Game Panel © 2025</p>
      </div>

      <ForgotPasswordModal
        visible={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default Login;
