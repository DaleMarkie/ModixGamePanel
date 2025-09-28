"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getServerUrl } from "@/app/config";
import "./login.css";

const Login = () => {
  const router = useRouter();
  const usernameRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"login" | "signup" | "recover">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success" | "info";
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedLicense, setGeneratedLicense] = useState("");
  const [masterExists, setMasterExists] = useState(false);

  useEffect(() => {
    const lastUser = localStorage.getItem("modix_last_username");
    if (lastUser) setUsername(lastUser);
    usernameRef.current?.focus();

    // check if master exists
    fetch(`${getServerUrl()}/api/auth/master_exists`)
      .then((res) => res.json())
      .then((data) => setMasterExists(data.exists))
      .catch(() => setMasterExists(false));
  }, []);

  const resetMessages = () => setMessage(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (mode === "recover") {
        if (!username || !email)
          throw new Error("Username and email are required for recovery.");
        const res = await fetch(`${getServerUrl()}/api/auth/recover`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setMessage({ text: "✅ Recovery email sent!", type: "success" });
        } else {
          throw new Error(data.message || "Account recovery failed.");
        }
      } else {
        if (!username || !password || (mode === "signup" && !email))
          throw new Error("All fields are required.");

        if (mode === "signup" && masterExists) {
          throw new Error("Master account already exists. Sign up disabled.");
        }

        const endpoint = mode === "signup" ? "signup" : "login";
        const body: any = { username, password };
        if (mode === "signup") body.email = email;

        const res = await fetch(`${getServerUrl()}/api/auth/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const result = await res.json();

        if (res.ok && result.token) {
          localStorage.setItem("modix_token", result.token);
          localStorage.setItem("modix_user", JSON.stringify(result.user));
          if (rememberMe) localStorage.setItem("modix_last_username", username);
          else localStorage.removeItem("modix_last_username");

          if (mode === "signup") {
            setGeneratedLicense(result.generated_license);
            setMessage({
              text: `✅ Master account created! License: ${result.generated_license}`,
              type: "success",
            });
            setMasterExists(true);
          } else {
            router.push("/auth/myaccount");
          }
        } else {
          throw new Error(result.message || "Something went wrong.");
        }
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
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>
          {mode === "login"
            ? "Sign In"
            : mode === "signup"
            ? "Sign Up"
            : "Recover Account"}
        </h2>

        <input
          ref={usernameRef}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        {(mode === "signup" || mode === "recover") && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}
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
            : mode === "login"
            ? "🚀 Log In"
            : mode === "signup"
            ? "🚀 Sign Up"
            : "Send Recovery Email"}
        </button>

        <p className="toggle-link">
          {!masterExists && mode !== "signup" && (
            <strong
              onClick={() => {
                resetMessages();
                setMode("signup");
              }}
            >
              Sign Up
            </strong>
          )}{" "}
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

        {generatedLicense && (
          <div className="generated-license">
            <p>
              🎁 License key for joiners: <strong>{generatedLicense}</strong>
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;
