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
  },

  // --- Console / Live Terminal ---
  {
    label: "💻 Console",
    href: "/terminal",
  },

  // --- Mod Creation Suite ---
  {
    label: "🧩 My Mods",
    href: "/tools/modcreation",
    submenu: [
      { label: "📦 My Mods", href: "/FileBrowser" },
      { label: "🗂️ Workshop Manager", href: "/workshop" },
      { label: "🔍 Check Mod Updates", href: "/mymods/modupdates" },
      { label: "🆕 Create New Mod", href: "/mymods/createnewmod" },
      { label: "🖼️ Manage Assets", href: "/mymods/manageassets" },
    ],
  },

  // --- Player Tools ---
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

  // --- Server Management ---
  {
    label: "🎮 Server Management",
    href: "/server",
    submenu: [
      { label: "⚙️ Server Settings", href: "/servermanagement/ServerSettings" },
      { label: "💾 Backups", href: "/servermanagement/backup" },
      { label: "🧠 Auto Restart", href: "/servermanagement/autorestart" },
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

  // --- Monitoring ---
  {
    label: "📊 Monitoring",
    href: "/monitoring/performance",
  },

  // --- Security & Access ---
  {
    label: "🛡️ Security",
    href: "/tools/security",
    submenu: [
      { label: "🛡️ DDoS Manager", href: "/security/ddosmanager" },
      { label: "🔑 Admin Tokens", href: "/security/admin" },
      { label: "🚧 Firewall Rules", href: "/security/firewall" },
      { label: "🕵️ Audit Logs", href: "/security/audit" },
    ],
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

  // --- Automation ---
  {
    label: "🤖 Automation",
    href: "/automation",
    submenu: [
      { label: "📜 Custom Scripts", href: "/automation/scripts" },
      { label: "🕒 Scheduled Jobs", href: "/tools/scheduler" },
      { label: "🔗 Webhooks & APIs", href: "/automation/webhooks" },
    ],
  },

  // --- Game Tools (New Category) ---
  {
    label: "🎮 Game Tools",
    submenu: [
      {
        label: "Project Zomboid",
        submenu: [
          {
            label: "🗺️ Map Editor",
            href: "/games/projectzomboid/tools/mapeditor",
          },
        ],
      },
    ],
  },

  // --- Panel Settings ---
  {
    label: "⚙️ Panel Settings",
    href: "/platform-settings",
    submenu: [
      { label: "🗝️ API Keys", href: "/panelsettings/tokens" },
      { label: "🎨 Theme Customization", href: "/panelsettings/thememanager" },
      { label: "⬆️ Change Log", href: "/panelsettings/changelogs" },
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
    href: "https://discord.gg/EwWZUSR9tM",
  },
];
