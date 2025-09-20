"use client";

import { useState, useEffect } from "react";
import "./subscriptions.css";
import { useUser } from "../../UserContext";

interface LicenseInfo {
  plan: string;
  expires_at?: string | null;
}

interface Plan {
  id: string;
  name: string;
  icon: string;
  bgColor: string;
  borderColor: string;
  popular?: boolean;
  description: string;
  perks: string[];
  disabled?: boolean;
}

const LICENSE_SERVER_URL = "https://ffabc50f0a08.ngrok-free.app/";

const Subscriptions = () => {
  const { user, loading, refreshUser } = useUser();
  const [license, setLicense] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>({
    plan: "Free",
  });
  const [validating, setValidating] = useState(false);

  const plans: Plan[] = [
    {
      id: "personal",
      name: "Personal",
      icon: "💎",
      bgColor: "bg-green-900/70",
      borderColor: "border-green-500",
      description:
        "Free Plan gives full access to all core features of Modix: Game Panel — no hidden paywalls, no time limits, completely free.",
      perks: [
        "Full access to core features",
        "Discord Support",
        "Free forever",
      ],
    },
    {
      id: "pro",
      name: "Pro (30 days) - £3.00/mo",
      icon: "🌟",
      bgColor: "bg-blue-900/50",
      borderColor: "border-blue-500",
      popular: true,
      description:
        "Upgrade to Pro for exclusive perks like custom themes, priority support, and early access to experimental features.",
      perks: [
        "All Pro features",
        "Special Discord roles & recognition",
        "Custom theme settings",
        "Priority support",
        "Access to experimental features",
      ],
    },
    {
      id: "hosting",
      name: "Hosting (£10/month) - Coming Soon",
      icon: "🏢",
      bgColor: "bg-purple-900/50",
      borderColor: "border-purple-500",
      description:
        "For businesses or communities — powerful tools, commercial licensing, and no branding.",
      perks: [
        "All Hosting features",
        "Special Discord roles & recognition",
        "Custom theme settings",
        "Priority support for hosting",
        "License to sell addons commercially",
        "Access to experimental features",
        "No Branding",
      ],
      disabled: true,
    },
  ];

  // Fetch user's license info if user exists
  useEffect(() => {
    const fetchLicenseInfo = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${LICENSE_SERVER_URL}/api/licenses/list`);
        const data = await res.json();

        // ✅ FIX: match username in user objects
        const userLicense = Object.values(data).find((l: any) =>
          l.users?.some((u: any) => u.username === user.username)
        ) as LicenseInfo | undefined;

        setLicenseInfo(userLicense || { plan: "Free" });
      } catch (err) {
        console.error(err);
        setLicenseInfo({ plan: "Free" });
      }
    };
    fetchLicenseInfo();
  }, [user]);

  const handleRedeem = async () => {
    if (!license.trim()) {
      setMessage("Enter a license code.");
      setMessageType("error");
      return;
    }
    setValidating(true);
    setMessage("");
    setMessageType("info");

    try {
      const res = await fetch(`${LICENSE_SERVER_URL}/api/licenses/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          license_code: license.toUpperCase(),
          username: user?.username || "guest",
        }),
      });
      const data = await res.json();

      if (data.success) {
        setLicenseInfo(data.license as LicenseInfo);
        setMessage(`✅ License applied! Plan: ${data.license.plan}`);
        setMessageType("success");
        setLicense("");
        if (user && refreshUser) await refreshUser();
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

  return (
    <section className="card subscription-card px-6 py-12">
      <h3 className="text-3xl font-bold mb-2 text-center text-white">
        📦 Available Modix Plans
      </h3>

      {user && !loading && (
        <p className="text-center text-gray-300 mb-6 max-w-xl">
          Welcome, <strong>{user.username}</strong>! You are logged in.
        </p>
      )}

      <p className="text-center text-green-200 mb-8 max-w-3xl mx-auto leading-relaxed">
        With the <span className="font-semibold">Free Plan</span>, you’ll always
        have full access to core features. Upgrade to{" "}
        <span className="font-semibold">Pro</span> or{" "}
        <span className="font-semibold">Hosting</span> for extra perks.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`${plan.bgColor} ${
              plan.borderColor
            } border-l-8 rounded-xl p-5 shadow-lg relative hover:scale-105 transition-transform ${
              plan.disabled ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {plan.popular && !plan.disabled && (
              <div className="absolute top-3 right-3 bg-yellow-400 text-black px-2 py-1 text-xs font-bold rounded-full">
                Most Popular
              </div>
            )}

            {/* Show badge if current user has this plan */}
            {licenseInfo?.plan &&
              plan.name
                .toLowerCase()
                .includes(licenseInfo.plan.toLowerCase()) && (
                <div className="absolute top-3 left-3 bg-green-500 text-black px-2 py-1 text-xs font-bold rounded-full">
                  Your Plan
                </div>
              )}

            <div className="flex items-center justify-center mb-3 text-5xl">
              {plan.icon}
            </div>
            <h4 className="text-xl font-bold text-center mb-1">{plan.name}</h4>
            <p className="text-center text-gray-300 mb-3">{plan.description}</p>
            <ul className="text-gray-200 mb-0 list-disc list-inside space-y-0.5">
              {plan.perks.map((perk, i) => (
                <li key={i}>{perk}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Redeem Section */}
      <div className="redeem-section mt-8 text-center">
        <div className="mb-4">
          <p className="font-semibold text-green-200">
            Current License: {licenseInfo?.plan}{" "}
            {licenseInfo?.expires_at && (
              <span className="text-green-400">
                (Expires:{" "}
                {new Date(licenseInfo.expires_at).toLocaleDateString()})
              </span>
            )}
          </p>
        </div>

        <input
          type="text"
          placeholder="Enter license code"
          value={license}
          onChange={(e) => setLicense(e.target.value.toUpperCase())}
          className="license-input"
          disabled={validating}
        />
        <button
          className="upgrade-btn"
          onClick={handleRedeem}
          disabled={validating}
        >
          {validating ? "Validating..." : "Redeem License"}
        </button>

        {message && (
          <p
            className={`license-message mt-3 ${
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
      </div>
    </section>
  );
};

export default Subscriptions;
