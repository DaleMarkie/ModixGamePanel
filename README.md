# Modix: Project 
### 🔒 Private Repository

> 🚧 This repository is **not open source** and intended for **internal development only**.  
> You may not redistribute, fork, publish, or share this project without explicit permission.  
> Development is currently ongoing for **v1.1.2**.

---

### 🧩 Key Features

- 🔧 **Server Controls** — Start, stop, restart, and gracefully shut down PZ servers
- 🧠 **Real-time Logs** — Live terminal view using Server-Sent Events (SSE)
- ⚙️ **Full Settings Editor** — Modify `server.ini` and `SandboxVars.lua` from the UI
- 🧱 **Mod Manager** — Enable/disable/uninstall Workshop mods with tag-based search and auto-thumbnail detection
- 🖥️ **System Dashboard** — Monitor server stats like OS, CPU, memory, GPU, and open ports
- 🌐 **Webhook Support** — Create and send custom Discord-style embed messages
- 🧰 **File Manager** — Browse, upload, and edit server-side files in a clean UI

---

### 💻 Stack

| Layer       | Tech Used                     |
|-------------|-------------------------------|
| Frontend    | React (CRA), Tailwind, React Icons |
| Backend     | Flask (Python 3), SSE, Systemd |
| Hosting     | Linux (Ubuntu/Debian), Nginx recommended |
| Game Support| Project Zomboid (Steam + Workshop) |

---

### 🛠️ Current Development Status

- Version: `v1.1.2` (WIP)
- UI polishing in progress (dark theme, scrollable cards, mod thumbnails)
- Mod scanning logic from `108600/` Steam Workshop directory in place
- Full API connection between frontend and Flask backend established

---

### 🧑‍💻 Developer Guidelines

- This repository is private; invite-only for core contributors
- All changes must maintain cross-browser compatibility (Chrome, Firefox)
- Avoid breaking the backend API contract (Flask routes on `/api/*`)
- Stick to Tailwind conventions and keep UI responsive
- PRs should be tested locally before push

---