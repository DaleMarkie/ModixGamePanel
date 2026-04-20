🧩 Modix: Game Panel - https://discord.gg/6qN3MxcE6y

- Modix is a completely free, open-source, browser-based control panel built primarily for Project Zomboid, with support for other Steam-modded games being actively worked on.
- This is a solo-developed project — built and maintained by one person in their own time. Because of that, progress isn’t always fast or consistent, but everything added is done properly with long-term stability in mind.

🐞 Bugs & Support

- 🧾 Report issues or request features on GitHub (Issues tab)
- 💬 For help or discussion

⚡ Quick Start (Linux / ChromeOS / Debian)

Clone the project
- git clone https://github.com/DaleMarkie/ModixGamePanel.git
- cd ModixGamePanel
- npm run setup → installs everything (frontend + backend + python)
- npm run dev → starts the panel (frontend + API)
- This will start both services automatically:

🌐 Frontend: http://localhost:3000/
⚙️ Backend API: http://localhost:2010/ Start the project (DEV MODE)

🎯 Why I’m Building Modix

I started Modix because most game server panels are either:

- Paid / locked behind subscriptions
- Overcomplicated or bloated
- Or rely on third-party hosting where you don’t fully control your server

Modix is the opposite of that.

It’s built to give people:

- Full control over their own servers
- A clean, modern UI without unnecessary complexity
- A completely free alternative to paid panels

No subscriptions. No locked features. No nonsense.

⚙️ What Modix Does

Modix runs locally on your machine and lets you manage your server entirely through your browser.

- ⚡ Real-time server control (start, stop, restart safely)
- 🧠 Live terminal & logs (no need to touch the actual console)
- ⚙️ Full config editing (server.ini, SandboxVars.lua, etc.)
- 🧱 Mod & Workshop management (enable, disable, update)
- 🧰 File manager (upload, edit, organise files)
- 🌐 Webhook support for Discord-style notifications

Everything is designed to be fast, simple, and actually useful — not just flashy.

🧠 How It Works

Modix uses a local backend (FastAPI + Python) and connects to your game server through scripts and system processes.

That means:

- You host everything yourself
- You own your data and server
- No external services are required

🚧 Project Scope (Real Talk)

This is not a small project.

It covers:

- Frontend (React UI)
- Backend API (FastAPI)
- Real-time systems (SSE logs)
- File systems & process control
- Game-specific integrations

And it’s all being built solo.

So yeah — things may break, features may take time, and updates won’t always be frequent. But the goal is to build something solid, not rushed.

💸 Cost

Completely free.

- No paid tiers
- No hidden features
- No “premium unlocks”

Just download it, run it, and use it.

- 🐞 Bugs & Support
- 🧾 Report issues or request features on GitHub (Issues tab)
- 💬 Get help or follow development on Discord: https://discord.gg/K38RSpyQUa

🎮 Supported Games

Main focus:

Project Zomboid

Planned / partial support:
ARK, Rust, DayZ, Minecraft, RimWorld, Valheim, and more

⚠️ Support for other games is still in development — expect missing or incomplete features.

⚖️ License

- ✅ Free for personal, educational, and community use
- ✅ You can modify and contribute
- 🚫 No commercial use
- 🚫 No reuploading or reselling

Full license details are included in the project.

![Modix Preview](https://i.ibb.co/8LyjCpWd/Screenshot-2026-04-15-21-54-52.png)

- Local Login System

  
![Modix Preview](https://i.ibb.co/Zy076nJ/Screenshot-2026-04-15-22-02-14.png)

- My Account
![Modix Preview](https://i.ibb.co/wF2MmtCJ/Screenshot-2026-04-15-22-04-47.png)

- Terminal 

This is where you can control your game server. 


![Modix Preview](https://i.ibb.co/xKPpf795/Screenshot-2026-04-15-22-06-30.png)

- Change Game  

You can see all supported games. 

![Modix Preview](https://i.ibb.co/fzMqYyMc/Screenshot-2026-04-15-22-07-22.png)

- Server Settings. 

This will allow you to easily change the settings of project zomboid. 


![Modix Preview](https://i.ibb.co/tTmgLkvF/Screenshot-2026-04-15-22-08-12.png

- Modix Installer 

Instam require files for supported games. No hassle. 
![Modix Preview](https://i.ibb.co/6RkgkJLM/Screenshot-2026-04-15-22-09-28.png)

-Server Performance 

See detailed information about your local system.


![Modix Preview](https://i.ibb.co/67Ytq9pK/Screenshot-2026-04-15-22-11-34.png)
- Port Checker

You can see all ports that are open / closed. 
![Modix Preview](https://i.ibb.co/sdVMz66v/Screenshot-2026-04-15-22-12-24.png)

- API "WIP" 

Check all API endpoints and see what they do. Pretty helpful when building upon Modix.
![Modix Preview](https://i.ibb.co/tTmWWZmC/Screenshot-2026-04-15-22-13-14.png)
- Theme Manager: 

You can change up the look of the panel. 
![Modix Preview](https://i.ibb.co/qLmy3sXV/Screenshot-2026-04-15-22-16-18.png)

- Staff Chat. 

You can talk with our staff memebers right here too. 
