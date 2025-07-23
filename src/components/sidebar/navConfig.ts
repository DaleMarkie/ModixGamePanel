// src/app/navConfig.js

export const navLinks = [
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
      { label: "🛒 Browse Workshop", href: "/workshop" },
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
];

export const extraSearchPages = [];

export const searchablePages = [...navLinks, ...extraSearchPages];
