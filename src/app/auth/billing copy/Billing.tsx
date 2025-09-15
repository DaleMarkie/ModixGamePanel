"use client";

import React from "react";

const plans = [
  {
    id: "personal",
    name: "Modix Personal",
    price: "£0",
    description: "Forever free. Ideal for hobby servers and personal projects.",
    features: [
      {
        name: "Game Servers",
        description: "Run 1 game server instance with full control.",
        included: true,
      },
      {
        name: "Mod Manager",
        description: "Manage and update mods easily for your server.",
        included: true,
      },
      {
        name: "Terminal Access",
        description: "Access your server's terminal for advanced control.",
        included: true,
      },
      {
        name: "Auto Updates",
        description: "Automatic updates keep your server and mods fresh.",
        included: true,
      },
      {
        name: "Community Sharing",
        description: "Share mods and configurations with the community.",
        included: false,
      },
      {
        name: "Pro Modules",
        description: "Exclusive premium modules with advanced features.",
        included: false,
      },
      {
        name: "Priority Support",
        description: "Get help faster with prioritized support channels.",
        included: false,
      },
      {
        name: "Hosting Edition Features",
        description: "Advanced features tailored for hosting providers.",
        included: false,
      },
    ],
  },
  {
    id: "pro",
    name: "Modix Pro",
    price: "£5/mo",
    description: "Premium features for power users and server owners.",
    features: [
      {
        name: "Game Servers",
        description:
          "Unlimited game server instances for multiple communities.",
        included: true,
      },
      {
        name: "Mod Manager",
        description: "Advanced mod & plugin synchronization and management.",
        included: true,
      },
      {
        name: "Terminal Access",
        description: "Full terminal access with enhanced tools.",
        included: true,
      },
      {
        name: "Auto Updates",
        description: "Keep everything up to date automatically.",
        included: true,
      },
      {
        name: "Community Sharing",
        description: "Share and discover community-created mods and configs.",
        included: true,
      },
      {
        name: "Pro Modules",
        description: "Access exclusive pro-only modules and integrations.",
        included: true,
      },
      {
        name: "Priority Support",
        description: "Fast-tracked support with dedicated assistance.",
        included: true,
      },
      {
        name: "Hosting Edition Features",
        description: "Advanced hosting features coming soon.",
        included: false,
      },
    ],
  },
  {
    id: "host",
    name: "Hosting Edition",
    price: "£10/mo",
    description:
      "Tailored for professional hosting providers with dedicated resources.",
    features: [
      {
        name: "Game Servers",
        description: "Host unlimited game servers with dedicated SLAs.",
        included: true,
      },
      {
        name: "Mod Manager",
        description: "Full control with bulk management and automation.",
        included: true,
      },
      {
        name: "Terminal Access",
        description: "Advanced terminal tools with extended monitoring.",
        included: true,
      },
      {
        name: "Auto Updates",
        description: "Enterprise-grade update systems with rollback support.",
        included: true,
      },
      {
        name: "Community Sharing",
        description: "Seamless community integration and sharing tools.",
        included: true,
      },
      {
        name: "Pro Modules",
        description: "All pro modules plus hosting-specific modules.",
        included: true,
      },
      {
        name: "Priority Support",
        description: "24/7 priority support with SLA guarantees.",
        included: true,
      },
      {
        name: "Hosting Edition Features",
        description: "Dedicated features for hosting providers (coming soon).",
        included: true,
      },
    ],
  },
];

export default function Billing() {
  return (
    <main className="min-h-screen bg-zinc-900 text-white px-6 py-12 flex flex-col items-center">
      <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
        Choose Your Modix Plan
      </h1>
      <p className="text-gray-400 mb-12 text-center max-w-3xl leading-relaxed">
        Modix offers powerful plans suited for everyone — from hobbyists running
        a single server to professional hosting providers managing many.
        <br />
        Each plan gives you full access to features, with differences mainly in
        support level and advanced tools.
      </p>

      <div className="overflow-x-auto max-w-7xl w-full border border-green-700 rounded-xl">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="bg-green-800/90 text-green-200 uppercase text-xs font-semibold">
            <tr>
              <th className="p-3 w-72 text-left">Feature</th>
              {plans.map((plan) => (
                <th
                  key={plan.id}
                  className={`p-3 text-center border-l border-green-700 £{
                    plan.id === "host" ? "bg-green-900/90" : "bg-green-900/70"
                  }`}
                >
                  <div className="text-lg font-bold mb-1">{plan.name}</div>
                  <div className="text-green-300 font-semibold">
                    {plan.price}
                  </div>
                  <div className="text-green-400 mt-1 text-xs font-normal">
                    {plan.description}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-green-700/50">
            {plans[0].features.map((feature, i) => (
              <tr key={"feat-" + i} className="group hover:bg-green-900/40">
                <td
                  className="p-3 border border-green-700 relative cursor-help"
                  title={feature.description}
                >
                  {feature.name}
                  {/* Tooltip */}
                  <div
                    role="tooltip"
                    className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-64 p-3 bg-black bg-opacity-90 border border-green-600 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                  >
                    {feature.description}
                    <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-black border border-green-600 rotate-45"></div>
                  </div>
                </td>
                {plans.map((plan) => {
                  const f = plan.features[i];
                  return (
                    <td
                      key={plan.id + "-" + i}
                      className={`p-3 border border-green-700 text-center £{
                        plan.id === "host"
                          ? "bg-green-900/90"
                          : "bg-green-900/70"
                      }`}
                    >
                      {f.included ? (
                        <span
                          aria-label="Included"
                          role="img"
                          className="text-green-400 font-bold"
                        >
                          ✅
                        </span>
                      ) : (
                        <span
                          aria-label="Not Included"
                          role="img"
                          className="text-red-500 font-bold"
                        >
                          ⛔
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Buttons row */}
            <tr className="bg-green-800/90">
              <td className="p-3 font-semibold uppercase tracking-wide text-green-200 text-center">
                Choose Plan
              </td>
              {plans.map((plan) => (
                <td
                  key={plan.id + "-btn"}
                  className={`border border-green-800 p-3 text-center £{
                    plan.id === "host" ? "bg-green-900/90" : "bg-green-900/70"
                  }`}
                >
                  <button
                    disabled={plan.id !== "personal"}
                    className={`w-full py-2 rounded-md font-semibold uppercase tracking-wide
                      £{
                        plan.id === "personal"
                          ? "bg-gray-600 cursor-not-allowed"
                          : "bg-green-600 cursor-not-allowed opacity-70"
                      }
                    `}
                  >
                    {plan.id === "personal" ? "Current Plan" : "Coming Soon"}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-sm text-green-400 mt-8 text-center max-w-xl leading-relaxed">
        You can switch plans anytime. No hidden fees. All plans include full
        features — support levels and hosting provider tools vary by plan.
      </p>
    </main>
  );
}
