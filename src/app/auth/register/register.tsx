"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import "./register.css"; // Adjust path if necessary

const Register = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [licensePlan, setLicensePlan] = useState("personal");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!agreeToTerms) {
      return setError("You must agree to the Modix Terms of Service.");
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    if (!form.username || !form.email || !form.password || !form.fullName) {
      return setError("Please fill out all fields.");
    }

    try {
      // Call the internal Next.js API route for registration
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          email: form.email,
          fullName: form.fullName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Signup failed.");
      }

      setShowLicenseModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLicenseConfirm = () => {
    console.log("License selected:", licensePlan);
    setShowLicenseModal(false);
    router.push("/login"); // ✅ Next.js route navigation
  };

  const handleLicenseCancel = () => {
    setShowLicenseModal(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">📝 Sign Up for Modix</h1>

        <form onSubmit={handleSignup} className="login-form">
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />

          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            placeholder="modixadmin"
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
            required
          />

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            required
          />

          <label className="terms-checkbox">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              required
            />
            &nbsp; I agree to the{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              Modix Terms of Service
            </a>
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-button">
            ✅ Create Account
          </button>

          <div className="login-extra">
            <span>Already have an account? </span>
            <a href="/login" className="forgot-password">
              Login here
            </a>
          </div>
        </form>

        <p className="login-footer">Modix Game Panel © 2025</p>
      </div>

      {showLicenseModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Select Your Licensing Plan</h2>
            <p>Please choose a licensing plan to run Modix:</p>

            <div style={{ marginTop: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "12px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="licensePlan"
                  value="personal"
                  checked={licensePlan === "personal"}
                  onChange={() => setLicensePlan("personal")}
                  style={{ marginRight: "10px" }}
                />
                Personal (Free) — For individual use
              </label>

              <label
                style={{
                  display: "block",
                  marginBottom: "12px",
                  color: "#888",
                  cursor: "not-allowed",
                }}
              >
                <input
                  type="radio"
                  name="licensePlan"
                  value="host"
                  disabled
                  style={{ marginRight: "10px" }}
                />
                Host (Coming Soon) — For hosting servers (Unavailable)
              </label>
            </div>

            <div className="modal-actions">
              <button onClick={handleLicenseConfirm}>Confirm</button>
              <button onClick={handleLicenseCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
