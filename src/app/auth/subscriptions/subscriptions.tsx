"use client";

import { useState } from "react";
import "./subscriptions.css";
import { useUser } from "../../UserContext";

const Subscriptions = () => {
  const { user } = useUser();
  const [license, setLicense] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: "personal",
      name: "Personal",
      icon: "💎",
      bgColor: "bg-green-900/70",
      borderColor: "border-green-500",
      description:
        "Free user plan will always have full access to core features.",
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
      description: "Unlock extra perks by donating.",
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
      description: "For hosting providers. Coming soon!",
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

  const handleRedeem = async () => {
    if (!license)
      return setMessage("Enter a license code or Ko-fi transaction ID.");
    if (!user) return setMessage("User not loaded.");

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`http://localhost:2010/api/licenses/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code: license.toUpperCase(),
          user: user.username,
          ip: "127.0.0.1",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`License redeemed! Plan: ${data.license.plan}`);
        setLicense("");
      } else {
        setMessage(
          data.detail ||
            "Failed to redeem license. Check your code or Ko-fi transaction ID."
        );
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card subscription-card px-6 py-12">
      <h3 className="text-3xl font-bold mb-2 text-center text-white">
        📦 Available Modix Plans
      </h3>
      <p className="text-center text-green-200 mb-8">
        Free user plan will always have full access to core features. Upgrade to Pro or Hosting for extra perks once available.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`${plan.bgColor} ${plan.borderColor} border-l-8 rounded-xl p-5 shadow-lg relative hover:scale-105 transition-transform ${
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
        <input
          type="text"
          placeholder="Enter license code or Ko-fi transaction ID"
          value={license}
          onChange={(e) => setLicense(e.target.value.toUpperCase())}
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

      {/* Donation Info & Policy Section */}
      <div className="donation-info mt-12 p-6 bg-green-800 text-white rounded-xl shadow-lg text-center space-y-4">
        <h4 className="text-2xl font-bold mb-2">
          💚 All Donations Go Directly to Development
        </h4>
        <p className="text-green-100">
          Your support helps Modix Game Panel bring amazing features, expand to other operating systems, and improve the platform for all users.
        </p>

        <div className="donation-policy text-left max-w-xl mx-auto space-y-2">
          <p className="flex items-start gap-2">
            <span className="text-green-400 text-xl">✅</span>
            <span>
              <strong>No refund policy:</strong> All donations are final and go directly to supporting Modix development.
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-green-400 text-xl">✅</span>
            <span>
              <strong>Cancel anytime:</strong> Pro or Hosting subscriptions last for the period you’ve supported and can be stopped at any time.
            </span>
          </p>
        </div>

        {/* External Links Buttons - Horizontal Row */}
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <a
            href="https://ko-fi.com/modixgamepanel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[120px] bg-[#29abe0] hover:bg-[#248fbf] text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform transform hover:scale-105 text-center"
          >
            ☕ Ko-fi
          </a>
          <a
            href="https://modix.store/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform transform hover:scale-105 text-center"
          >
            🛒 Store
          </a>
          <a
            href="https://discord.gg/ernMdys9"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[120px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform transform hover:scale-105 text-center"
          >
            💬 Discord
          </a>
          <a
            href="https://steamcommunity.com/sharedfiles/filedetails/?id=3422448677"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[120px] bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform transform hover:scale-105 text-center"
          >
            🎮 Steam
          </a>
        </div>

      </div>
    </section>
  );
};

export default Subscriptions;
