"use client";

import { useState, useEffect } from "react";
import "./subscriptions.css";
import { getServerUrl } from "@/app/config"; // centralized config

interface LicenseInfo {
  plan: string;
  created_at?: string;
  expires_at?: string | null;
  owner?: string;
  active_users?: string[];
}

const SERVER_URL = getServerUrl(); // centralized server URL

const Subscriptions = () => {
  const [user, setUser] = useState<any>(null);
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [redeemCode, setRedeemCode] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [validating, setValidating] = useState(false);

  // ---------------- Load User ----------------
  useEffect(() => {
    const storedUser = localStorage.getItem("modix_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("modix_user");
      }
    }
  }, []);

  // ---------------- Fetch License Info ----------------
  useEffect(() => {
    if (!user) return;

    const fetchLicense = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/licenses/list`);
        if (!res.ok) throw new Error("Server error fetching license list.");
        const data = await res.json();

        const myLicense = Object.values(data).find((l: any) =>
          l.active_users?.includes(user.username)
        ) as LicenseInfo | undefined;

        setLicenseInfo(
          myLicense || {
            plan: "Free",
            owner: user.username,
            created_at: new Date().toISOString(),
            expires_at: null,
            active_users: [user.username],
          }
        );
      } catch (err) {
        console.error(err);
        setMessage("⚠️ Could not load license info. Defaulting to Free plan.");
        setMessageType("error");
        setLicenseInfo({
          plan: "Free",
          owner: user.username,
          created_at: new Date().toISOString(),
          expires_at: null,
          active_users: [user.username],
        });
      }
    };

    fetchLicense();
  }, [user]);

  const isOwner = user?.username === licenseInfo?.owner;

  // ---------------- Redeem License ----------------
  const handleRedeem = async () => {
    if (!redeemCode.trim()) {
      setMessage("Enter a license code.");
      setMessageType("error");
      return;
    }
    if (!isOwner) {
      setMessage("Only the license owner can redeem a license.");
      setMessageType("error");
      return;
    }

    setValidating(true);
    setMessage("");
    setMessageType("info");

    try {
      const res = await fetch(`${SERVER_URL}/api/licenses/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          license_code: redeemCode.toUpperCase(),
          username: user.username,
        }),
      });

      if (!res.ok) throw new Error("Failed to reach license server.");
      const data = await res.json();

      if (data.success && data.license) {
        setLicenseInfo(data.license);
        setMessage(`✅ License applied! Plan: ${data.license.plan}`);
        setMessageType("success");
        setRedeemCode("");
      } else {
        setMessage(`❌ ${data.detail || "Invalid license code."}`);
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Cannot reach license server.");
      setMessageType("error");
    } finally {
      setValidating(false);
    }
  };

  // ---------------- Kick Sub-user ----------------
  const handleKickUser = async (usernameToKick: string) => {
    if (!isOwner) return;
    setMessage(`Removing ${usernameToKick}...`);
    setMessageType("info");

    try {
      const res = await fetch(`${SERVER_URL}/api/licenses/kick`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          license_plan: licenseInfo?.plan,
          username_to_kick: usernameToKick,
        }),
      });

      if (!res.ok) throw new Error("Failed to reach license server.");
      const data = await res.json();

      if (data.success) {
        setLicenseInfo((prev) => ({
          ...prev!,
          active_users: prev?.active_users?.filter((u) => u !== usernameToKick),
        }));
        setMessage(`✅ ${usernameToKick} removed from license.`);
        setMessageType("success");
      } else {
        setMessage(`❌ ${data.detail || "Failed to remove user."}`);
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Cannot reach license server.");
      setMessageType("error");
    }
  };

  // ---------------- Render ----------------
  if (!user) return <p>Please log in to view your license.</p>;

  return (
    <section className="card subscription-card px-6 py-12">
      <h3 className="text-3xl font-bold mb-4 text-center text-white">
        📦 Your License
      </h3>

      {licenseInfo ? (
        <>
          {/* ---------------- License Info ---------------- */}
          <div className="license-info">
            <p>
              <strong>Plan:</strong> {licenseInfo.plan}
            </p>
            <p>
              <strong>Owner:</strong> {licenseInfo.owner}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {licenseInfo.created_at
                ? new Date(licenseInfo.created_at).toLocaleDateString()
                : "N/A"}
            </p>
            <p>
              <strong>Expires:</strong>{" "}
              {licenseInfo.expires_at
                ? new Date(licenseInfo.expires_at).toLocaleDateString()
                : "Never"}
            </p>
          </div>

          {/* ---------------- Active Users ---------------- */}
          <div className="active-users-section">
            <h4>Active Users ({licenseInfo.active_users?.length || 0}):</h4>
            <ul>
              {licenseInfo.active_users?.map((u) => (
                <li key={u}>
                  <span>{u}</span>
                  {isOwner && u !== user.username && (
                    <button
                      className="kick-btn"
                      onClick={() => handleKickUser(u)}
                    >
                      Kick
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* ---------------- Redeem Section ---------------- */}
          {isOwner && (
            <div className="redeem-section">
              <input
                type="text"
                placeholder="Enter license code"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                disabled={validating}
              />
              <button onClick={handleRedeem} disabled={validating}>
                {validating ? "Validating..." : "Redeem License"}
              </button>
            </div>
          )}

          {/* ---------------- Messages ---------------- */}
          {message && (
            <p
              className={`license-message ${
                messageType === "success"
                  ? "text-green-400"
                  : messageType === "error"
                  ? "text-red-400"
                  : "text-white"
              }`}
            >
              {message}
            </p>
          )}
        </>
      ) : (
        <p>Loading license info...</p>
      )}
    </section>
  );
};

export default Subscriptions;
