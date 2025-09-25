export const navLinks = [
  {
    label: "👤 Account Info",
    href: "/auth/myaccount",
  },
  {
    label: "📊 Dashboard",
    href: "/dashboard",
  },
  {
    label: "💻 Terminal",
    href: "/terminal",
  },
  {
    label: "📦 Mod Manager",
    href: "/workshop",
  },
  {
    label: "🗂️ File Manager",
    href: "/FileBrowser",
  },
  {
    label: "👥 Player Management",
    href: "/players",
    submenu: [
      { label: "🧍 All PLayers", href: "/PlayerManagement/AllPlayers" },
      { label: "🔍 Player Search", href: "/steamplayermanager" },
      { label: "💬 Chat Logs", href: "/PlayerManagement/ChatLogs" },
      { label: "⛔ Players Banned", href: "/PlayerManagement/PlayerBanned" },
    ],
  },
  {
    label: "🎮 Game Config",
    href: "/settings",
    submenu: [
      { label: "⚙️ General Settings", href: "/server/ServerSettings" },
      { label: "🧑 User Permissions", href: "/RBAC" },
    ],
  },
  {
    label: "📣 Discord Integration",
    href: "/",
    submenu: [
      {
        label: "🛠️ Webhooks",
        href: "/support",
        submenu: [
          { label: "✉️ Send Embed", href: "/discordwebhooks" },
          { label: "💾 Saved Webhooks", href: "/webhooks/saved" },
          { label: "⚙️ Webhook Settings", href: "/webhooks/settings" },
          { label: "📚 Templates Library", href: "/webhooks/templates" },
        ],
      },
    ],
  },
  {
    label: "🛠️ Tools",
    href: "/tools",
    submenu: [
      {
        label: "📊 Monitoring",
        href: "/tools/monitoring",
        submenu: [
          { label: "📈 Your Server Stats", href: "/tools/performance" },
          { label: "🌐 Port Checker", href: "/tools/portcheck" },
          { label: "🛡️ DDoS Manager", href: "/tools/ddosmanager" },
          { label: "🧮 Firewall Manager", href: "/tools/firewallmanager" },
        ],
      },
    ],
  },
  {
    label: "⚙️ Settings",
    href: "/platform-settings", // <-- renamed href to avoid clash
    submenu: [
      { label: "🗝️ API Keys & Tokens", href: "/settings/tokens" },
      { label: "🎨 Theme Customization", href: "/settings/themesettings" },
      { label: "🧬 Update Modix", href: "/server/updater" },
    ],
  },

  {
    label: "🔐 Account",
    href: "/login",
    submenu: [
      { label: "🔓 Sign In", href: "/auth/login" },
      { label: "📝 Register", href: "/auth/register" },
      { label: "♻️ Recover Account", href: "/auth/recover" },
    ],
  },
];
