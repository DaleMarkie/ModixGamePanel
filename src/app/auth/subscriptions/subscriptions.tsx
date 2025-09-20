"use client";

import { useState, useEffect, ChangeEvent } from "react";
import "./subscriptions.css";
import { useUser } from "../../UserContext";

// Define a type for the license info
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

// Your public ngrok URL
const LICENSE_SERVER_URL = "https://759c8b38ac42.ngrok-free.app";

const Subscriptions = () => {
  const { user } = useUser();
  const [license, setLicense] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);

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
        "- Full access to core features",
        "- Discord Support",
        "- Free forever",
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
        "- All Pro features",
        "- Special Discord roles & recognition",
        "- Custom theme settings",
        "- Priority support",
        "- Access to experimental features",
      ],
      disabled: true,
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
        "- All Hosting features",
        "- Special Discord roles & recognition",
        "- Custom theme settings",
        "- Priority support for hosting",
        "- License to sell addons commercially",
        "- Access to experimental features",
        "- No Branding",
      ],
      disabled: true,
    },
  ];

  // Fetch current license info on load
  useEffect(() => {
    const fetchLicenseInfo = async () => {
      if (!user) return;

      try {
        const res = await fetch(`${LICENSE_SERVER_URL}/api/licenses/list`);
        const data = await res.json();

        // Check if user has a valid license
        const userLicense = Object.values(data).find(
          (lic: any) => lic.username === user.username
        );

        if (userLicense) {
          setLicenseInfo(userLicense as LicenseInfo);
        } else {
          setLicenseInfo(null);
        }
      } catch (err) {
        console.error("Error fetching license info:", err);
        setLicenseInfo(null);
      }
    };
    fetchLicenseInfo();
  }, [user]);

  const handleRedeem = async () => {
    if (!license) return setMessage("Enter a license code.");
    if (!user) return setMessage("User not loaded.");

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${LICENSE_SERVER_URL}/api/licenses/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          license_code: license.toUpperCase(),
          username: user.username,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setLicenseInfo(data.license as LicenseInfo);
        setMessage(`License redeemed! Plan: ${data.license.plan}`);
        setLicense("");
      } else {
        setMessage(data.detail || "Failed to redeem license. Check your code.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Cannot reach license server. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLicense(e.target.value.toUpperCase());
  };

  return (
    <section className="card subscription-card px-6 py-12">
      <h3 className="text-3xl font-bold mb-2 text-center text-white">
        📦 Available Modix Plans
      </h3>
      <p className="text-center text-green-200 mb-8 max-w-3xl mx-auto leading-relaxed">
        With the <span className="font-semibold">Free Plan</span>, you’ll always
        have full access to core features. Upgrade to{" "}
        <span className="font-semibold">Pro</span> for extra perks.
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
        <div className="mb-4 text-green-200">
          <p>
            <span className="font-semibold">Current License:</span>{" "}
            {licenseInfo ? (
              <>
                {licenseInfo.plan}{" "}
                {licenseInfo.expires_at && (
                  <span className="text-green-400">
                    (Expires:{" "}
                    {new Date(licenseInfo.expires_at).toLocaleDateString()})
                  </span>
                )}
              </>
            ) : (
              "Free"
            )}
          </p>
        </div>

        <input
          type="text"
          placeholder="Enter license code"
          value={license}
          onChange={handleInputChange}
          className="license-input"
        />
        <button
          className="upgrade-btn"
          onClick={handleRedeem}
          disabled={loading}
        >
          {loading ? "Validating..." : "Redeem License"}
        </button>
        {message && (
          <p className="license-message mt-3 text-white">{message}</p>
        )}
      </div>
    </section>
  );
};

export default Subscriptions;
