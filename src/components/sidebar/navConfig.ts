export const navLinks = [
  {
    label: "📊 Dashboard",
    href: "/dashboard",
    submenu: [
      { label: "🖥️ My Servers", href: "/auth/myservers" },
      { label: "👤 Account", href: "/auth/myaccount" },
      { label: "🔑 My Licensing", href: "/auth/mylicensing" },
      { label: "🎟️ Support Tickets", href: "/auth/support/tickets" },
      { label: "🛠️ Settings", href: "/auth/mysettings" },
    ],
  },
  {
    label: "🧩 Configuration",
    href: "/settings",
    submenu: [
      { label: "⚙️ General Settings", href: "/settings/general" },
      { label: "🛡️ Theme Settings", href: "/themesettings" },
      { label: "🛡️ User Permissions", href: "/rbac" },
      { label: "🎮 Game Library", href: "/games" },
      { label: "⬆️ Update Modix", href: "/updater" },
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
      { label: "🛍️ Browse Workshop", href: "/workshop" },
      { label: "🔄 Mod Updater", href: "/modupdater" },
    ],
  },
  {
    label: "🗂️ File Manager",
    href: "/FileBrowser",
  },
  {
    label: "🎮 Players",
    href: "/players",
    submenu: [
      { label: "👥 Player Manager", href: "/players/all" },
      { label: "🧍 Steam Player Manager", href: "/players/online" },
    ],
  },
  {
    label: "📣 Webhooks",
    href: "/webhooks",
    submenu: [
      { label: "🧾 Send Embed", href: "/discordwebhooks" },
      { label: "💾 Saved Webhooks", href: "/tools/performance" },
    ],
  },
  {
    label: "🛠️ Tools",
    href: "/tools",
    submenu: [
      { label: "🔌 Plugin Tools", href: "/tools/plugins" },
      { label: "📈 Performance Stats", href: "/tools/performance" },
      { label: "🌐 Port Checker", href: "/tools/portcheck" },
      { label: "🛡️ DDoS Manager", href: "/tools/ddosmanager" },
      { label: "🧮 Steam Parser", href: "/tools/steamparser" },
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

export const allPages = [
  { label: "🏠 Dashboard Home", href: "/" },
  { label: "🔄 Mod Updater", href: "/mod-updater" },
  { label: "🛍️ Workshop", href: "/workshop" },
  { label: "📶 Server Status", href: "/server-status" },
  { label: "🆘 Support", href: "/support" },
  { label: "📘 Documentation", href: "/docs" },
  { label: "❓ FAQ", href: "/support/faq" },
];

export const extraSearchPages = [];

export const searchablePages = [...navLinks, ...extraSearchPages];
