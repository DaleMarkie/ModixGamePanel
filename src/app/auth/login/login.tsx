"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ForgotPasswordModal from "../ForgotPasswordModal"; // Ensure this is Next-compatible
import "./login.css"; // Adjust path as needed

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
      // Call the internal Next.js API route with the raw password
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      // Accept either 'success', 'access_token', or 'token' as a sign of successful login
      if (
        response.ok &&
        (result.success === true || result.access_token || result.token)
      ) {
        router.push("/auth/myaccount"); // ✅ Next.js route change
      } else {
        setError(result.message || "Invalid username or password.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  const handleSignUp = () => {
    router.push("/signup"); // ✅ Next.js navigation
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

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        visible={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default Login;
