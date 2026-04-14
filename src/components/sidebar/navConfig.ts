// navConfig.ts
export interface NavItem {
  label: string;
  href?: string; // optional
  submenu?: NavItem[];
  disabled?: boolean; // optional disabled flag
}

export const navLinks: NavItem[] = [
  // --- Account / Profile ---
  {
    label: "👤 Account",
    href: "/auth/myaccount",
    submenu: [
      { label: "📊 Dashboard", href: "/auth/myaccount" },
      { label: "📜 Activity", href: "/auth/activity" },
      { label: "🧾 My License", href: "/auth/License" },
      { label: "👥 Sub-Users", href: "/auth/subusers" },
      { label: "⚙️ Settings", href: "/auth/myaccount/settings" },
    ],
  },

  // --- Console / Live Terminal ---
  {
    label: "💻 Terminal",
    href: "/terminal",
  },

  // --- Server Management ---
  {
    label: "🎮 My Server",
    href: "/server",
    submenu: [
      { label: "🎮 Change Game", href: "/games" },
      { label: "⚙️ Server Settings", href: "/servermanagement/ServerSettings" },
      { label: "💾 Backups", href: "/servermanagement/backup" },
      {
        label: "🎮 Steam Tools",
        href: "/tools/steamparser",
        submenu: [
          { label: "⚙️ Install", href: "/servermanagement/steamtools/install" },
          { label: "🔁 Update", href: "/servermanagement/steamtools/update" },
          {
            label: "🧼 Validate Files",
            href: "/servermanagement/steamtools/validate",
          },
        ],
      },
    ],
  },

  // --- Mod Creation Suite ---
  {
    label: "🧩 Mods",
    href: "/tools/modcreation",
    submenu: [
      { label: "📦 My Mods", href: "/FileBrowser" },
      { label: "🗂️ Workshop Manager", href: "/workshop" },
      { label: "🔍 Mod Debugger", href: "/mymods/debugger" },
      { label: "🔍 Check Mod Updates", href: "/mymods/modupdates" },
    ],
  },

  {
    label: "🗂️ File Manager",
    href: "/filebrowser",
    submenu: [
    ],
  },

  // --- Player Tools ---
  {
    label: "👥 Players",
    href: "/players",
    submenu: [
      { label: "📋 Player List", href: "/PlayerManagement/AllPlayers" },
      {
        label: "🔎 Player Search",
        href: "/PlayerManagement/steamplayermanager",
      },
      { label: "💬 Chat Logs", href: "/PlayerManagement/ChatLogs" },
      { label: "🎮 Session History", href: "/PlayerManagement/SessionHistory" },
      {
        label: "🚫 Bans & Restrictions",
        href: "/PlayerManagement/PlayerBanned",
      },
      { label: "⚠️ Warnings & Notes", href: "/PlayerManagement/PlayerNotes" },
    ],
  },

  // --- Monitoring ---
  {
    label: "📊 Monitoring",
    href: "/monitoring/performance",
  },

  // --- Network ---
  {
    label: "🌐 Network",
    href: "/network",
    submenu: [
      { label: "📡 Check Ports", href: "/network/ports" },
      { label: "🧱 Firewall Rules", href: "/network/firewall" },
      { label: "🚨 Connection Logs", href: "/network/logs" },
    ],
  },

  // --- Panel Settings ---
  {
    label: "⚙️ Panel Settings",
    href: "/platform-settings",
    submenu: [
      { label: "🗝️ API Keys", href: "/panelsettings/tokens" },
      { label: "🎨 Theme Customization", href: "/panelsettings/thememanager" },
    ],
  },

  // --- Staff Chat ---
  {
    label: "💬 Staff Chat",
    href: "/staffchat",
  },

  // --- Support ---
  {
    label: "🆘 Support",
    href: "https://discord.gg/zC3SC7NMAD",
  },
];
