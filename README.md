
| Layer        | Tech Used                                       |
| ------------ | ----------------------------------------------- |
| Frontend     | React (CRA), Tailwind, React Icons              |
| Backend      | FastAPI (uvicorn) (Python 3), SSE, Systemd      |
| Database     | JSON config, SQLite                             |
| Hosting      | Windows                                         |
| Game Support | Project Zomboid (Steam + Workshop + ModManager) |

# Modix: Project  
### 🔓 Open Source, Browser-Based Game Panel for Project Zomboid  

🚀 **Modix Game Panel** is a fully **browser-based, open source control panel** for Project Zomboid.  
It allows you to **manage every aspect of your server locally**, from starting/stopping the server to editing settings, managing mods, sending webhooks, and more.  

This project is designed for **community development and contributions**. You can **download, run, modify, and contribute** to it locally in your browser or on your system.  
Development is currently ongoing for **v1.1.2**.  

⚠️ **Disclaimer:** The Software may display **game logos or other images from Steam**. These assets are **not owned or created by the Modix Dev Team**. Modix only provides the **panel UI and backend functionality**.  

---

## 🧩 Key Features  

- 🔧 **Server Controls** — Start, stop, restart, and gracefully shut down Project Zomboid servers  
- 🧠 **Real-time Logs** — Live terminal view using Server-Sent Events (SSE)  
- ⚙️ **Full Settings Editor** — Modify `server.ini` and `SandboxVars.lua` directly from the UI  
- 🧱 **Mod Manager** — Enable/disable/uninstall Workshop mods with **tag-based search** and **auto-thumbnail detection**  
- 🌐 **Webhook Support** — Create and send custom Discord-style embed messages  
- 🧰 **File Manager** — Browse, upload, and edit server-side files in a clean UI  

---

## 💻 Tech Stack  

| Layer       | Tech Used                               |  
|-------------|-----------------------------------------|  
| Frontend    | React (CRA), Tailwind, React Icons       |  
| Backend     | FastAPI (uvicorn) (Python 3), SSE, Systemd |  
| Database    | JSON config, SQLite                     |  
| Hosting     | Windows                                 |  
| Game Support| Project Zomboid (Steam + Workshop + ModManager) |  

---

## ⚡🚀 Getting Started / Local Installation  

Run **Modix Game Panel** locally on your PC in a few simple steps:

### 💾 1. Download the Project
- Clone or download the repository: `Modix-Windows--main`
- Place the folder anywhere on your PC

### ✏️ 2. Rename the Folder (Optional)
- You may rename it, e.g., `Modix-Local`
- **Note:** Renaming does **not affect functionality**

### 📦 3. Install Dependencies
- Open **Command Prompt (CMD)** or **PowerShell** in the project folder
- Run:
```bash
npm install 
npm run dev

🌐 5. Access the Panel

Open your browser and go to:

http://localhost:3000

You should see the Modix Game Panel ready to use

💖 Support & Donations

All donations are welcome to help keep Modix development going. You can support us here:
https://ko-fi.com/modixgamepanel

❗ Important: You are not allowed to reupload Modix or any part of it to another website. The project must always be used from this official repository or your local environment.

🧑‍💻 Modix Game Panel Non-Commercial License (NC) – Version 1.4

Copyright (c) 2025 Ov3rlord (Dale Markie) and the Modix Dev Team

All parts of Modix Game Panel, including but not limited to: source code, API code, frontend, backend, UI components, assets, documentation, and any content officially produced by the Modix Dev Team (collectively the "Software"), are the exclusive property of Ov3rlord (Dale Markie) and the Modix Dev Team.

You may use the Software locally in your browser, on your system, or in a personal development environment for personal, educational, or community development purposes, and you are encouraged to contribute to the project. Ownership remains solely with the original authors, and you may never claim ownership of the Software or any derivative work, even if modified.

- License Grant

Subject to these terms, Ov3rlord and the Modix Dev Team grant you a non-exclusive, non-transferable, non-commercial license to:

Use the Software locally for personal, educational, or community development purposes

Modify the Software locally for personal, educational, or community development purposes

Share modifications or contributions only for non-commercial purposes

Important: Users are strictly prohibited from copying, reusing, or extracting Modix UI components, frontend code, assets, or other parts of the Software to incorporate into another website, application, or software. You may only modify or build upon Modix within the context of this project for personal, educational, or community purposes.

- Add-ons and Extensions

Users may create and sell add-ons or extensions for Modix Game Panel, but only after being officially verified by the Modix Dev Team via our official Discord server: https://discord.gg/EwWZUSR9tM
.

Any add-on or extension sold without official verification is strictly prohibited

The Modix Dev Team reserves the right to revoke verification for violations of our rules or policies

- Prohibited Use

You may NOT use the Software, or any derivative works, for:

Cheating, exploiting, or bypassing game/client security

Hacking or performing illegal activities

Any activity that violates laws or third-party rights

Reusing Modix UI, frontend code, assets, or other parts of the Software in another website, application, or software

- Restrictions

You may NOT:

Sell, license, rent, or distribute the core Software or derivatives for profit or commercial purposes, except as allowed under Section 3 (verified add-ons)

Use the Software or derivatives in any commercial product or service without explicit permission

Remove, alter, or obscure any copyright, trademark, or attribution notices

Claim ownership of the Software or any derivative works

- Attribution

Any copies or modifications must:

Include this license in full

Clearly state the original authors: Ov3rlord (Dale Markie) and the Modix Dev Team

Include a visible reference to Modix Game Panel as the source of the Software

- Warranty Disclaimer

The Software is provided "as is" without warranty of any kind, express or implied. Ov3rlord and the Modix Dev Team shall not be liable for any damages arising from the use or inability to use the Software.

- License Updates

Ov3rlord and the Modix Dev Team reserve the right to update or modify this license at any time. Users are responsible for reviewing the license for updates and must comply with the most recent version.

- Enforcement

Any violation of this license immediately terminates your rights to use the Software. Ov3rlord and the Modix Dev Team reserve the right to pursue legal action against anyone violating the non-commercial, prohibited use, or any other terms of this license.

- Governing Law

This license shall be governed by and interpreted according to the laws of the United Kingdom (or your preferred jurisdiction).

By downloading, copying, modifying, contributing to, or using the Software, you agree to be bound by these terms. The Software remains the exclusive property of Ov3rlord (Dale Markie) and the Modix Dev Team at all times, while being fully open source for community development under the conditions outlined above.
