// src/app/navConfig.js

export const navLinks = [
  // ... same navLinks array as before ...
  {
    label: "🧭 Dashboard",
    href: "/dashboard",
    submenu: [
      { label: "🖥️ My Servers", href: "/auth/myservers" },
      { label: "🧪 Account", href: "/auth/myaccount" },
      { label: "📄 My Licensing", href: "/auth/mylicensing" },
      { label: "📍 Support Tickets", href: "/auth/support/tickets" },
      { label: "⚙️ Settings", href: "/auth/mysettings" },
    ],
  },
  {
    label: "🖥️ Terminal",
    href: "/terminal",
  },
  {
    label: "⚙️ Configuration",
    href: "/settings",
    submenu: [
      { label: "⚙️ General Settings", href: "/settings/general" },
      { label: "🧪 Sandbox Options", href: "/settings/sandbox" },
      { label: "📄 server.ini", href: "/settings/serverini" },
      { label: "📍 Spawn Points", href: "/settings/spawnpoints" },
      { label: "🧟 Zombie Settings", href: "/settings/zombies" },
    ],
  },
  {
    label: "🧰 Mods",
    href: "/modmanager",
    submenu: [
      { label: "🧩 Installed Mods", href: "/modmanager" },
      { label: "🛒 Browse Workshop", href: "/workshop" },
      { label: "🔄 Mod Update Checker", href: "/modupdater" },
    ],
  },
  {
    label: "📁 Files",
    href: "/filemanager",
    submenu: [
      { label: "📂 My Files", href: "/filemanager/uploads" },
      { label: "⚙️ Config Files", href: "/filemanager/configs" },
      { label: "🧾 SandboxVars.lua", href: "/filemanager/sandboxvars" },
      { label: "📄 Server Logs", href: "/filemanager/logs" },
    ],
  },
  {
    label: "👥 Players",
    href: "/players",
    submenu: [
      { label: "👥 All Players", href: "/players/all" },
      { label: "🟢 Online Players", href: "/players/online" },
      { label: "🚫 Banned Players", href: "/players/banned" },
      { label: "✅ Whitelist", href: "/players/whitelist" },
    ],
  },
  {
    label: "📡 Webhooks",
    href: "/webhooks",
    submenu: [
      { label: "📤 Send Embed", href: "/webhook" },
      { label: "💾 Saved Webhooks", href: "/webhooks/saved" },
      { label: "📝 Webhook Logs", href: "/webhooks/logs" },
    ],
  },
  {
    label: "🛠 Tools",
    href: "/tools",
    submenu: [
      { label: "📈 Performance Stats", href: "/tools/performance" },
      { label: "🌐 Port Checker", href: "/tools/portcheck" },
      { label: "🎨 Theme Manager", href: "/tools/theme" },
      { label: "📦 Plugin Tools", href: "/tools/plugins" },
    ],
  },
  {
    label: "🆘 Support",
    href: "/support",
    submenu: [
      { label: "📚 Documentation", href: "/docs" },
      { label: "🎫 Support Tickets", href: "/support/" },
      { label: "❓ FAQ", href: "/support/faq" },
    ],
  },
  {
    label: "🔐 Account",
    href: "/login",
    submenu: [
      { label: "🔐 Sign In", href: "/auth/login" },
      { label: "🆕 Register", href: "/auth/register" },
    ],
  },
];

export const allPages = [
  { label: "Dashboard Home", href: "/" },
  { label: "Mod Updater", href: "/mod-updater" },
  { label: "Workshop", href: "/workshop" },
  { label: "Server Status", href: "/server-status" },
  { label: "Support", href: "/support" },
  { label: "Documentation", href: "/docs" },
  { label: "FAQ", href: "/support/faq" },
  // add more pages here as needed
];

export const extraSearchPages = [
  // Add any extra search pages here, or leave empty if not needed
];

export const searchablePages = [...navLinks, ...extraSearchPages];
