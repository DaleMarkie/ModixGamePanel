// navConfig.ts
export interface NavItem {
  label: string;
  href: string;
  submenu?: NavItem[];
}

export const navLinks: NavItem[] = [
  {
    label: "👤 Account Info",
    href: "/auth/myaccount",
  },
  {
    label: "🎮 My Server",
    href: "/settings",
    submenu: [
      { label: "⚙️ Terminal", href: "/terminal" },
      { label: "📦 Mod Manager", href: "/FileBrowser" },
      { label: "🗂️ Workshop Manager", href: "/workshop" },
      { label: "🔄 Check Mod Updates", href: "/ModUpdates" },
    ],
  },
  {
    label: "🛠️ Mod Creation",
    href: "/tools/modcreation",
    submenu: [
      { label: "📦 Create New Mod", href: "/tools/modcreation/new" },
      { label: "🖼️ Manage Assets", href: "/tools/modcreation/assets" },
      { label: "📝 Edit Mod Info", href: "/tools/modcreation/info" },
      { label: "⚙️ Build & Export Mod", href: "/tools/modcreation/build" },
      {
        label: "🌐 Steam Workshop Upload",
        href: "/tools/modcreation/workshop",
      },
    ],
  },
  {
    label: "👥 Player Management",
    href: "/players",
    submenu: [
      {
        label: "🧍 Player Overview",
        href: "/PlayerManagement/AllPlayers",
        submenu: [
          { label: "📋 All Players", href: "/PlayerManagement/AllPlayers" },
          { label: "🔍 Player Search", href: "/steamplayermanager" },
        ],
      },
      {
        label: "📊 Player Activity",
        href: "/PlayerManagement/Activity",
        submenu: [
          { label: "💬 Chat Logs", href: "/PlayerManagement/ChatLogs" },
          {
            label: "🎮 Session History",
            href: "/PlayerManagement/SessionHistory",
          },
        ],
      },
      {
        label: "⛔ Player Restrictions",
        href: "/PlayerManagement/Bans",
        submenu: [
          {
            label: "⛔ Players Banned",
            href: "/PlayerManagement/PlayerBanned",
          },
          {
            label: "⚠️ Warnings & Notes",
            href: "/PlayerManagement/PlayerNotes",
          },
        ],
      },
    ],
  },
  {
    label: "🧰 Tools",
    href: "/tools",
    submenu: [
      {
        label: "⚡ Server & Performance",
        href: "/tools/server",
        submenu: [
          { label: "📈 Server Stats", href: "/tools/performance" },
          { label: "📝 Log Viewer / Stream", href: "/tools/logs" },
          { label: "💾 Backup & Restore", href: "/tools/backup" },
          { label: "⏰ Scheduler / Maintenance", href: "/tools/scheduler" },
        ],
      },
      {
        label: "🎮 Steam & Mods",
        href: "/tools/mods",
        submenu: [
          { label: "✉️ Steam Parser", href: "/tools/steamparser" },
          { label: "⚙️ Steam Install / Update", href: "/tools/steam/install" },
        ],
      },
      {
        label: "🛡️ Security & Admin",
        href: "/tools/security",
        submenu: [
          { label: "🛡️ DDoS Manager", href: "/tools/ddosmanager" },
          { label: "🔑 Admin Tokens", href: "/tools/admin" },
          { label: "🛡️ Firewall Rules", href: "/tools/firewall" },
        ],
      },
      { label: "📣 Discord Integration", href: "/webhooks" },
    ],
  },
  {
    label: "⚙️ Settings",
    href: "/platform-settings",
    submenu: [
      { label: "🗝️ API Keys & Tokens", href: "/settings/tokens" },
      { label: "🎨 Theme Customization", href: "/settings/thememanager" },
      { label: "🧬 Update Modix", href: "/server/updater" },
    ],
  },
  { label: "📝 Staff Chat", href: "/staffchat" },
  { label: "🆘 Support", href: "https://discord.gg/EwWZUSR9tM" },
];
