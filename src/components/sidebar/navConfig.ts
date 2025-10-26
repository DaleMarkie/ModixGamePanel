// navConfig.ts
export interface NavItem {
  label: string;
  href: string;
  submenu?: NavItem[];
}

export const navLinks: NavItem[] = [
  {
    label: "👤 Account",
    href: "/auth/myaccount",
  },
  {
    label: "🎮 Server Management",
    href: "/server",
    submenu: [
      { label: "💻 Terminal Console", href: "/terminal" },
      { label: "📦 Mod Manager", href: "/FileBrowser" },
      { label: "🗂️ Workshop Manager", href: "/workshop" },
      { label: "🔍 Check Mod Updates", href: "/ModUpdates" },
      { label: "⚙️ Server Settings", href: "/server/ServerSettings" },
    ],
  },
  {
    label: "👥 Players",
    href: "/players",
    submenu: [
      { label: "📋 Player List", href: "/PlayerManagement/AllPlayers" },
      { label: "🔎 Player Search", href: "/steamplayermanager" },
      { label: "💬 Chat Logs", href: "/PlayerManagement/ChatLogs" },
      { label: "🎮 Session History", href: "/PlayerManagement/SessionHistory" },
      {
        label: "🚫 Bans & Restrictions",
        href: "/PlayerManagement/PlayerBanned",
      },
      { label: "⚠️ Warnings & Notes", href: "/PlayerManagement/PlayerNotes" },
    ],
  },
  {
    label: "🧩 Mod Creation Suite",
    href: "/tools/modcreation",
    submenu: [
      { label: "🆕 Create New Mod", href: "/tools/modcreation/new" },
      { label: "🖼️ Manage Assets", href: "/tools/modcreation/assets" },
      { label: "📝 Edit Mod Info", href: "/tools/modcreation/info" },
      { label: "⚙️ Build & Export", href: "/tools/modcreation/build" },
      { label: "🌐 Upload to Workshop", href: "/tools/modcreation/workshop" },
    ],
  },
  {
    label: "🛠️ Admin Tools",
    href: "/tools",
    submenu: [
      {
        label: "⚡ Server Performance",
        href: "/tools/performance",
      },
      {
        label: "🧾 Log Viewer",
        href: "/tools/logs",
      },
      {
        label: "💾 Backups & Restore",
        href: "/tools/backup",
      },
      {
        label: "⏰ Task Scheduler",
        href: "/tools/scheduler",
      },
      {
        label: "🎮 Steam Integration",
        href: "/tools/steamparser",
        submenu: [
          { label: "✉️ Steam Parser", href: "/tools/steamparser" },
          { label: "⚙️ Steam Install / Update", href: "/tools/steam/install" },
        ],
      },
      {
        label: "🛡️ Security & Access",
        href: "/tools/security",
        submenu: [
          { label: "🛡️ DDoS Manager", href: "/tools/ddosmanager" },
          { label: "🔑 Admin Tokens", href: "/tools/admin" },
          { label: "🚧 Firewall Rules", href: "/tools/firewall" },
        ],
      },
      { label: "🤖 Discord Webhooks", href: "/webhooks" },
    ],
  },
  {
    label: "⚙️ Panel Settings",
    href: "/platform-settings",
    submenu: [
      { label: "🗝️ API Keys", href: "/settings/tokens" },
      { label: "🎨 Theme Customization", href: "/settings/thememanager" },
      { label: "⬆️ Change Log", href: "/server/updater" },
    ],
  },
  {
    label: "💬 Staff Chat",
    href: "/staffchat",
  },
  {
    label: "🆘 Support",
    href: "https://discord.gg/EwWZUSR9tM",
  },
];
