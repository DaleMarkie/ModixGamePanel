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
| Backend     | Fast API (uvicorn) (Python 3), SSE, Systemd |
| Database    | Json config, SQLite|
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

Modix Game Panel Non-Commercial License (NC) – Version 1.3
Copyright (c) 2025 Ov3rlord (Dale Markie) and the Modix Dev Team

1. OWNERSHIP
   All parts of Modix Game Panel, including but not limited to: source code, API code, frontend, backend, assets, documentation, and any content officially produced by the Modix Dev Team (collectively the "Software"), are the **exclusive property of Ov3rlord (Dale Markie) and the Modix Dev Team**.  
   You may use the Software, including modifying it for personal or educational purposes, **but ownership remains solely with the original authors**. You may **never claim ownership of the Software or any derivative work**, even if modified.

2. LICENSE GRANT
   Subject to these terms, Ov3rlord and the Modix Dev Team grant you a **non-exclusive, non-transferable, non-commercial license** to:
   - Use the Software for personal, educational, or evaluation purposes.
   - Modify the Software for personal or educational purposes.
   - Share the Software or modifications **only for non-commercial purposes**.

3. ADD-ONS AND EXTENSIONS
   Users **may create and sell add-ons or extensions** for Modix Game Panel, **but only after being officially verified by the Modix Dev Team** via our official Discord server: [https://discord.gg/EwWZUSR9tM](https://discord.gg/EwWZUSR9tM).  
   - Any add-on or extension sold without official verification is strictly prohibited.  
   - The Modix Dev Team reserves the right to revoke verification for violations of our rules or policies.

4. PROHIBITED USE
   You may NOT use the Software, or any derivative works, for:
   - Cheating, exploiting, or bypassing game/client security.  
   - Hacking or performing illegal activities.  
   - Any activity that violates laws or third-party rights.  

5. RESTRICTIONS
   You may NOT:
   - Sell, license, rent, or distribute the core Software or derivatives for profit or commercial purposes, except as allowed under Section 3 (verified add-ons).  
   - Use the Software or derivatives in any commercial product or service without explicit permission.  
   - Remove, alter, or obscure any copyright, trademark, or attribution notices.  
   - Claim ownership of the Software or any derivative works.

6. ATTRIBUTION
   Any copies or modifications must:
   - Include this license in full.
   - Clearly state the original authors: Ov3rlord (Dale Markie) and the Modix Dev Team.
   - Include a visible reference to Modix Game Panel as the source of the Software.

7. WARRANTY DISCLAIMER
   The Software is provided "as is" without warranty of any kind, express or implied. Ov3rlord and the Modix Dev Team shall not be liable for any damages arising from the use or inability to use the Software.

8. LICENSE UPDATES
   Ov3rlord and the Modix Dev Team **reserve the right to update or modify this license at any time**.  
   Users are responsible for reviewing the license for updates and must comply with the most recent version.  
   Please check this page regularly when new updates become available.

9. ENFORCEMENT
   Any violation of this license immediately terminates your rights to use the Software.  
   Ov3rlord and the Modix Dev Team reserve the right to pursue legal action against anyone violating the non-commercial, prohibited use, or any other terms of this license.

10. GOVERNING LAW
   This license shall be governed by and interpreted according to the laws of the United Kingdom (or your preferred jurisdiction).

---

By downloading, copying, modifying, or using the Software, you agree to be bound by these terms. The Software **remains the exclusive property of Ov3rlord (Dale Markie) and the Modix Dev Team** at all times.

---
