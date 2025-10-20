"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getServerUrl } from "@/app/config";
import Signup from "../signup/signup";
import "./login.css";

const Login = () => {
  const router = useRouter();
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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (!username || !password) throw new Error("All fields are required.");

      const res = await fetch(`${getServerUrl()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const result = await res.json();

      if (res.ok && result.token) {
        localStorage.setItem("modix_token", result.token);
        localStorage.setItem("modix_user", JSON.stringify(result.user));
        if (rememberMe) localStorage.setItem("modix_last_username", username);
        else localStorage.removeItem("modix_last_username");

        router.push("/auth/myaccount");
      } else {
        throw new Error(result.message || "Something went wrong.");
      }
    } catch (err: any) {
      setMessage({
        text: err.message || "Server error. Try again later.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-background"
      style={{
        backgroundImage:
          'url("https://upload.wikimedia.org/wikipedia/en/7/73/Project_Zomboid_cover.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {mode === "signup" ? (
        <Signup onBack={() => setMode("login")} />
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
                <span className="checkmark" />
                Remember Me
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
