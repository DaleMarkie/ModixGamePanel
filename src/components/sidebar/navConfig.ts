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
      { label: "⚙️ General Settings", href: "/server/serversettings" },
      { label: "🧑‍⚖️ User Permissions", href: "/server/rbac" },
      { label: "🗃️ Game Library", href: "/server/games" },
      { label: "🩺 Modix Health", href: "/server/ModixHealth" },
      { label: "🧬 Update Modix Core", href: "/server/updater" },
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
          { label: "🔥 Browse Workshop", href: "/workshop" },
          { label: "🆕 Steam Collections", href: "/workshop_collections" },
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
      { label: "🧍 Player'ss Online", href: "/playermanager/online" },
      { label: "🧍 Player's Offlines", href: "/playermanager/offline" },
      { label: "🔍 Player Search", href: "/playermanager/search" },
      {
        label: "⛔ Player Records",
        href: "/players/records",
        submenu: [
          { label: "⛔ Player Bans", href: "/playermanager/bans" },
          { label: "📝 Player Notes", href: "/playermanager/notes" },
          { label: "📊 Player Stats", href: "/playermanager/stats" },
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
      { label: "🧩 Browse Plugins", href: "/communityplugins/browse" },
      {
        label: "⚙️ Manage Plugins",
        href: "/communityplugins/manage",
        badge: { text: "Inactive", color: "gray" },
      },
      {
        label: "📢 Plugin Announcements",
        href: "/communityplugins/announcements",
      },
    ],
  },
  {
    label: "⚙️ Settings",
    href: "/platform-settings", // <-- renamed href to avoid clash
    submenu: [
      { label: "🗝️ API Keys & Tokens", href: "/settings/tokens" },
      { label: "📜 Audit Logs", href: "/settings/audit" },
      { label: "🌍 Language & Region", href: "/settings/locale" },
      { label: "🛡️ Security Preferences", href: "/settings/security" },
      { label: "🎨 Theme Customization", href: "/settings/themesettings" },
    ],
  },
  {
    label: "🆘 Support",
    href: "/support",
    submenu: [
      { label: "📘 Documentation", href: "/support/docs" },
      { label: "🎟️ My Tickets", href: "/support/mytickets" },
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
