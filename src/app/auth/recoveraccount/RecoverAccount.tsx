"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./RecoverAccount.css"; // You may want to rename this to recover.css later

const RecoverAccount = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  const handleRecovery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setStatusMessage("");

    try {
      const response = await fetch("/api/auth/recover", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: emailOrUsername }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatusMessage(
          result.message ||
            "If the account exists, a recovery email has been sent."
        );
      } else {
        setError(result.message || "Unable to process request.");
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
          <strong>Recover your account access.</strong>
          <br />
          <br />
          If you've forgotten your password or can't log in, use this page to
          recover your Modix account.
          <br />
          <br />
          Enter your email or username and we’ll send recovery instructions.
        </p>
        <div className="illustration" aria-hidden="true">
          🔐
        </div>
      </aside>

      <main
        className="right-panel"
        role="main"
        aria-label="Recover account form"
      >
        <form onSubmit={handleRecovery} className="login-form" noValidate>
          <h2 className="form-title">Recover Account</h2>

          <label htmlFor="identifier" className="input-label">
            Email or Username
          </label>
          <input
            id="identifier"
            type="text"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            placeholder="Your email or username"
            required
            className="input-field"
          />

          {statusMessage && (
            <div className="success-message">{statusMessage}</div>
          )}
          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-login">
            🔄 Send Recovery Link
          </button>

          <div className="signup-prompt">
            Remembered it?
            <a href="/login" className="btn-signup ml-2">
              Back to login
            </a>
          </div>

          <footer className="footer">Modix Game Panel &copy; 2025</footer>
        </form>
      </main>
    </div>
  );
};

export default RecoverAccount;
