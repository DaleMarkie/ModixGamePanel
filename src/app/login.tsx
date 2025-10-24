"use client";
import { useState, useRef, useEffect } from "react";
import { verifyUser, addLocalUser, LocalUser } from "../utils/localUsers";
import "./login.css";

const Login = () => {
  const usernameRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Owner" | "Admin" | "SubUser">("SubUser");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const lastUser = localStorage.getItem("modix_last_username");
    if (lastUser) setUsername(lastUser);
    usernameRef.current?.focus();
  }, []);

  const resetMessages = () => setMessage(null);

  // --------------------------
  // Login
  // --------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      if (!username || !password) throw new Error("All fields are required.");
      const user = await verifyUser(username, password);
      localStorage.setItem("modix_user", JSON.stringify(user));
      if (rememberMe) localStorage.setItem("modix_last_username", username);
      else localStorage.removeItem("modix_last_username");

      setMessage({ text: `Welcome ${user.username}!`, type: "success" });
      setTimeout(() => (window.location.href = "/auth/myaccount"), 500);
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // Signup
  // --------------------------
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      if (!username || !password) throw new Error("All fields are required.");
      await addLocalUser(username, password, role);
      setMessage({ text: `User ${username} registered!`, type: "success" });
      setMode("login");
      setUsername("");
      setPassword("");
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-background">
      <form
        className="login-form"
        onSubmit={mode === "login" ? handleLogin : handleSignup}
      >
        <h2>{mode === "login" ? "Sign In" : "Sign Up"}</h2>

        <input
          ref={usernameRef}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

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

        {mode === "signup" && (
          <select value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="Owner">Owner</option>
            <option value="Admin">Admin</option>
            <option value="SubUser">SubUser</option>
          </select>
        )}

        {mode === "login" && (
          <label className="custom-checkbox">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span className="checkmark" /> Remember Me
          </label>
        )}

        {message && (
          <div
            className={`message ${
              message.type === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading
            ? "Processing..."
            : mode === "login"
            ? "🚀 Log In"
            : "📝 Sign Up"}
        </button>

        <p className="toggle-link">
          <strong
            onClick={() => {
              resetMessages();
              setMode(mode === "login" ? "signup" : "login");
            }}
          >
            {mode === "login" ? "Master Sign Up" : "Back to Login"}
          </strong>
        </p>
      </form>
    </div>
  );
};

export default Login;
