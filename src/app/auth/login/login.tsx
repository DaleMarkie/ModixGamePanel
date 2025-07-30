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
  const [showSocialPopup, setShowSocialPopup] = useState(false);

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

  const handleSocialClick = () => {
    setShowSocialPopup(true);
    setTimeout(() => {
      setShowSocialPopup(false);
    }, 3000);
  };

  return (
    <>
      <div className="container">
        <aside className="left-panel">
          <div className="logo">v1.1.2</div>
          <h1 className="welcome-title">Modix Game Panel</h1>
          <p className="welcome-subtitle">
            <strong>Effortless Server Management. Free Forever.</strong>
            <br />
            <br />
            Modix is a full-featured, cloud-ready panel built for gamers,
            communities, and server admins.
            <br />
            <br />
            Spin up, manage, and monitor your game servers with real-time
            insights, seamless automation, and intuitive controls — no technical
            skills needed.
            <br />
            <br />
            Join thousands who trust Modix to keep their servers online,
            optimized, and growing. Start for free, no credit card required.
          </p>
          <div className="illustration" aria-hidden="true">
            🎮
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
                <button
                  type="button"
                  className="social-btn discord"
                  onClick={handleSocialClick}
                >
                  Discord
                </button>
                <button
                  type="button"
                  className="social-btn steam"
                  onClick={handleSocialClick}
                >
                  Steam
                </button>
                <button
                  type="button"
                  className="social-btn facebook"
                  onClick={handleSocialClick}
                >
                  Facebook
                </button>
              </div>
              {showSocialPopup && (
                <div className="social-popup">
                  <strong>🚧 Feature coming soon!</strong>
                  <br />
                  Social login is not yet available. Please use standard login
                  for now.
                </div>
              )}
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
