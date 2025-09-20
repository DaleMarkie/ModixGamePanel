"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";

const SERVER_URL = "https://7a3513ab76c3.ngrok-free.app/"; // your Flask server

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [licenseCode, setLicenseCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, licenseCode }),
      });
      const result = await res.json();

      if (res.ok && result.token) {
        localStorage.setItem("modix_token", result.token);
        localStorage.setItem("modix_user", JSON.stringify(result.user));
        router.push("/auth/myaccount");
      } else {
        setError(result.message || "Invalid credentials or license.");
      }
    } catch {
      setError("Server error. Try again later.");
    }
  };

  return (
    <div className="container">
      <aside className="left-panel">
        <div className="logo">v1.1.2</div>
        <h1 className="welcome-title">Modix Game Panel</h1>
        <p>
          Demo account — Username: <strong>test1</strong>, Password:{" "}
          <strong>test1</strong>, License: <strong>PRO123</strong>
        </p>
      </aside>

      <main className="right-panel">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Sign In</h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="License Code"
            value={licenseCode}
            onChange={(e) => setLicenseCode(e.target.value)}
            required
          />

          {error && <div className="error-message">{error}</div>}

          <button type="submit">🚀 Log In</button>
        </form>
      </main>
    </div>
  );
};

export default Login;
