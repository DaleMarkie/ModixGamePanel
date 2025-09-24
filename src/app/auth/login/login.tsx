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
  const [license, setLicense] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" | "info" } | null>(null);
  const [loading, setLoading] = useState(false);

  // ---------------- Load last user ----------------
  useEffect(() => {
    const lastUser = localStorage.getItem("modix_last_username");
    const lastLicense = localStorage.getItem("modix_last_license");

    if (lastUser) setUsername(lastUser);
    if (lastLicense) setLicense(lastLicense);

    usernameRef.current?.focus();
  }, []);

  const resetMessages = () => setMessage(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (mode === "recover") {
        if (!username || !email) throw new Error("Username and email are required for recovery.");
        const res = await fetch(`${getServerUrl()}/api/auth/recover`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setMessage({ text: "✅ Recovery email sent! Follow instructions to reset your password.", type: "success" });
        } else {
          throw new Error(data.message || "Account recovery failed.");
        }
      } else {
        if (!username || !password || !license || (mode === "signup" && !email)) {
          throw new Error("All fields are required.");
        }

        const endpoint = mode === "signup" ? "signup" : "login";
        const body: any = { username, password, license_code: license };
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
          if (rememberMe) {
            localStorage.setItem("modix_last_username", username);
            localStorage.setItem("modix_last_license", license);
          } else {
            localStorage.removeItem("modix_last_username");
            localStorage.removeItem("modix_last_license");
          }
          router.push("/auth/myaccount");
        } else if (res.ok && result.success && mode === "signup") {
          setMessage({ text: "✅ Account created! You can now log in.", type: "success" });
          setMode("login");
          setPassword("");
          setEmail("");
        } else {
          throw new Error(result.message || "Something went wrong.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || "Server error. Try again later.", type: "error" });
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
          <>
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

            <div className="license-wrapper">
              <input
                type="text"
                placeholder="License Code"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                required
              />
              <p className="license-helper">
                Use <strong>"FREE"</strong> for free core features!
              </p>
            </div>

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
          </>
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
  Don't have an account?{" "}
  <strong onClick={() => { resetMessages(); setMode("signup"); }}>
    Sign Up / Recover
  </strong>{" "}
  |{" "}
  <strong onClick={() => { resetMessages(); setMode("recover"); }}>
    Recover Account
  </strong>
</p>

      </form>
    </div>
  );
};

export default Login;
