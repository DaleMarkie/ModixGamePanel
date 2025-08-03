export const navLinks = [
  {
    label: "📊 Dashboard",
    href: "/dashboard",
    submenu: [
      {
        label: "🖥️ Server Management",
        href: "/dashboard/servers",
        submenu: [
          { label: "🖥️ My Servers", href: "/auth/myservers" },
          { label: "🎟️ Support Tickets", href: "/auth/support/tickets" },
        ],
      },
      {
        label: "👤 User Profile",
        href: "/dashboard/profile",
        submenu: [
          { label: "👤 Account Info", href: "/auth/myaccount" },
          { label: "💳 Billing", href: "/auth/billing" },
          { label: "🔑 My License", href: "/license" },
          { label: "⚙️ Settings", href: "/auth/mysettings" },
        ],
      },
    ],
  },
  {
    label: "🎮 Server & Game Config",
    href: "/settings",
    submenu: [
      { label: "⚙️ General Settings", href: "/serversettings" },
      { label: "🧑‍⚖️ User Permissions", href: "/rbac" },
      { label: "🗃️ Game Library", href: "/games" },
      { label: "🩺 Modix Health", href: "/ModixHealth" },
      { label: "🧬 Update Modix Core", href: "/updater" },
    ],
  },
  {
    label: "💻 Terminal",
    href: "/terminal",
  },
  {
    label: "🧰 Mods",
    href: "/modmanager",
    submenu: [
      { label: "📦 My Mods", href: "/modmanager" },
      {
        label: "🛍️ Steam Workshop",
        href: "/workshop",
        submenu: [
          { label: "🔥 Browse Workshop", href: "/workshop/popular" },
          { label: "🆕 Steam Collections", href: "/workshop/new" },
        ],
      },
      {
        label: "🛠️ Mod Tools",
        href: "/modtoolss",
        submenu: [
          { label: "📊 Mod Performance", href: "/tools/performance" },
          { label: "🧪 Mod Debugger", href: "/tools/debugger" },
          { label: "🩺 Modix Health", href: "/ModixHealth" },
          { label: "🛠️ Mod Updaters", href: "/modupdater" },
        ],
      },
    ],
  },

  {
    label: "🗂️ File Manager",
    href: "/FileBrowser",
  },
  {
    label: "👥 Player Management",
    href: "/players",
    submenu: [
      { label: "🧍 Player Manager", href: "/SteamPlayerManager" },
      { label: "🔍 Player Search", href: "/players/search" },
      {
        label: "⛔ Player Records",
        href: "/players/records",
        submenu: [
          { label: "⛔ Player Bans", href: "/players/bans" },
          { label: "📝 Player Notes", href: "/players/notes" },
          { label: "📊 Player Stats", href: "/players/stats" },
        ],
      },
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
      { label: "📈 Performance Stats", href: "/tools/performance" },
      { label: "🌐 Port Checker", href: "/tools/portcheck" },
      { label: "🛡️ DDoS Manager", href: "/tools/ddosmanager" },
      { label: "🧮 FireWall Manager", href: "/tools/firewallmanager" },
    ],
  },
  {
    label: "🌐 Community Plugins",
    href: "/communityplugins",
    submenu: [
      { label: "🧩 Browse Plugins", href: "/communityplugins" },
      {
        label: "⚙️ Manage Plugins",
        href: "/communityplugins",
        badge: { text: "Inactive", color: "gray" },
      },
      {
        label: "📢 Plugin Announcements",
        href: "/communityplugins",
      },
    ],
  },
  {
    label: "⚙️ Settings",
    href: "/platform-settings", // <-- renamed href to avoid clash
    submenu: [
      { label: "🗝️ API Keys & Tokens", href: "/platform-settings/api" },
      { label: "📜 Audit Logs", href: "/platform-settings/audit" },
      { label: "🌍 Language & Region", href: "/platform-settings/locale" },
      { label: "🛡️ Security Preferences", href: "/platform-settings/security" },
      { label: "🎨 Theme Customization", href: "/themesettings" },
    ],
  },
  {
    label: "🆘 Support",
    href: "/support",
    submenu: [
      { label: "📘 Documentation", href: "/docs" },
      { label: "🎟️ Support Tickets", href: "/support/" },
      { label: "❓ FAQ", href: "/support/faq" },
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
