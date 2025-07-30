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
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <>
      <div className="container">
        <aside className="left-panel">
          <div className="container">
            <aside className="left-panel">
              <div className="logo">v1.1.2</div>
              <h1 className="welcome-title">
                Welcome to Modix
                <br />
                Game Panel
              </h1>
              <p className="welcome-subtitle">
                Sign in for free and take full control of your game servers.
                <br />
                <br />
                Modix is a powerful, secure, and user-friendly platform designed
                <br />
                to simplify server management whether you're running one server
                or one hundred.
                <br />
                <br />
                Get real-time monitoring, one-click deployment, and seamless
                automation,
                <br />
                all in one place.
                <br />
                <br />
                No hidden fees. No hassle. Just the tools you need to keep your
                community alive and thriving.
              </p>
              <div className="illustration" aria-hidden="true">
                🎮
              </div>
            </aside>
            {/* rest of your layout */}
          </div>
        </aside>

        <main className="right-panel" role="main" aria-label="Login form">
          <form onSubmit={handleLogin} className="login-form" noValidate>
            <h2 className="form-title">Sign In</h2>

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

            <button
              type="button"
              className="forgot-link"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot password?
            </button>

            <div className="signup-prompt">
              New here?{" "}
              <button
                type="button"
                onClick={handleSignUp}
                className="btn-signup"
              >
                Create an account
              </button>
            </div>

            <div className="social-login-container">
              <span>Or sign in with</span>
              <div className="social-buttons">
                <button type="button" className="social-btn discord">
                  Discord
                </button>
                <button type="button" className="social-btn steam">
                  Steam
                </button>
                <button type="button" className="social-btn facebook">
                  Facebook
                </button>
              </div>
            </div>

            <footer className="footer">Modix Game Panel &copy; 2025</footer>
          </form>
        </main>
      </div>

      <ForgotPasswordModal
        visible={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </>
  );
};

export default Login;
