// navConfig.ts
export interface NavItem {
  label: string;
  href?: string; // make href optional
  submenu?: NavItem[];
  disabled?: boolean; // add disabled flag
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

      // --- Disabled / Placeholder ---
      { label: "🔍 Check Mod Updates", disabled: true },
      { label: "🆕 Create New Mod", disabled: true },
      { label: "🖼️ Manage Assets", disabled: true },
      { label: "📝 Edit Mod Info", disabled: true },
      { label: "⚙️ Build & Export", disabled: true },
      { label: "🌐 Upload to Workshop", disabled: true },
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
      { label: "⚙️ Server Settings", href: "/server/ServerSettings" },
      { label: "💾 Backups", href: "/server/backups" },
      { label: "🧠 Auto Restart", href: "/server/autorestart" },
      {
        label: "🎮 Steam Tools",
        href: "/tools/steamparser",
        submenu: [
          { label: "⚙️ Install", href: "/tools/steam/install" },
          { label: "🔁 Update", href: "/tools/steam/update" },
          { label: "🧼 Validate Files", href: "/tools/steam/validate" },
        ],
      },
    ],
  },

  // --- Monitoring / Performance ---
  {
    label: "📊 Monitoring",
    href: "/monitoring",
    submenu: [
      { label: "💻 Server Performance", href: "/monitoring/performance" },
      { label: "🌐 Network Activity", href: "/monitoring/network" },
      { label: "🕒 Uptime Tracker", href: "/monitoring/uptime" },
      { label: "📈 Server Analytics", href: "/monitoring/analytics" },
    ],
  },

  // --- Security & Access ---
  {
    label: "🛡️ Security",
    href: "/tools/security",
    submenu: [
      { label: "🛡️ DDoS Manager", href: "/tools/ddosmanager" },
      { label: "🔑 Admin Tokens", href: "/tools/admin" },
      { label: "🚧 Firewall Rules", href: "/tools/firewall" },
      { label: "🕵️ Audit Logs", href: "/tools/audit" },
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
