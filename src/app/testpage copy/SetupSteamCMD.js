import React, { useState } from "react";
import "./SetupSteamCMD.css"; // make sure your CSS is saved here

const SetupSteamCMD = () => {
  const [steamcmdPath, setSteamcmdPath] = useState("/home/steamcmd");
  const [pzInstallPath, setPzInstallPath] = useState("/home/pzserver");
  const [log, setLog] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [operation, setOperation] = useState(null);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const runOperation = async (type) => {
    setLoading(true);
    setDone(false);
    setOperation(type);
    setLog("");

    const targetPath = type === "steamcmd" ? steamcmdPath : pzInstallPath;
    setLog(`⏳ Starting ${type === "steamcmd" ? "SteamCMD installation" : "Project Zomboid server install/update"} at:\n${targetPath}\n\n`);

    try {
      const response = await fetch(
        type === "steamcmd" ? "/api/setup-steamcmd" : "/api/install-pz-server",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: targetPath }),
        }
      );

      if (!response.body) throw new Error("No response body received.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done: doneReading, value } = await reader.read();
        if (doneReading) break;
        const chunk = decoder.decode(value, { stream: true });
        setLog((prev) => prev + chunk);
      }

      setLog((prev) =>
        prev + `\n✅ ${type === "steamcmd" ? "SteamCMD installation" : "Project Zomboid server update"} completed successfully.\n`
      );
      setDone(true);
    } catch (error) {
      setLog((prev) => prev + `\n❌ Error: ${error.message}\n`);
    } finally {
      setLoading(false);
      setOperation(null);
    }
  };

  return (
    <div className="dashboard setup-steamcmd">
      <h1>⚙️ SteamCMD & Project Zomboid Server Installer</h1>
      <p>
        Use this tool to easily install and update SteamCMD and your Project Zomboid server files.
        You can choose custom installation directories below.
      </p>

      {/* SteamCMD Installation */}
      <section>
        <h2>1. SteamCMD Installation Directory</h2>
        <p>
          Specify where SteamCMD should be installed. Ensure you have sufficient disk space and write permissions.
        </p>
        <input
          type="text"
          aria-label="SteamCMD installation directory"
          value={steamcmdPath}
          onChange={(e) => setSteamcmdPath(e.target.value)}
          disabled={loading}
        />
        <button
          className="dashboard-btn"
          onClick={() => runOperation("steamcmd")}
          disabled={loading}
        >
          {loading && operation === "steamcmd" ? "Installing SteamCMD..." : "🚀 Install SteamCMD"}
        </button>
      </section>

      <hr />

      {/* Project Zomboid Server Installation */}
      <section>
        <h2>2. Project Zomboid Server Installation Directory</h2>
        <p>
          This folder will hold your Project Zomboid server files. Verify that you have enough disk space and write permissions.
        </p>
        <input
          type="text"
          aria-label="Project Zomboid server installation directory"
          value={pzInstallPath}
          onChange={(e) => setPzInstallPath(e.target.value)}
          disabled={loading}
        />
        <button
          className="dashboard-btn"
          onClick={() => runOperation("pzserver")}
          disabled={loading}
        >
          {loading && operation === "pzserver" ? "Installing/Updating Project Zomboid Server..." : "🚀 Install/Update Project Zomboid Server"}
        </button>
      </section>

      {/* Logs */}
      <section>
        <h2>📜 Log Output</h2>
        <pre aria-live="polite" aria-atomic="true">{log || "Logs will appear here..."}</pre>
        {done && <div className="success-message">✅ Operation completed successfully.</div>}
      </section>

      {/* Manual Instructions */}
      <section className="setup-info" aria-label="Manual installation and update instructions">
        <h2>📚 Manual Installation & Update Guide</h2>

        <article>
          <h3>Installing SteamCMD Manually (Linux)</h3>
          <p>Run these commands in your terminal:</p>
          <pre className="code-block">
{`sudo apt update
sudo apt install steamcmd`}
          </pre>
          <button className="dashboard-btn" onClick={() => copyToClipboard("sudo apt update\nsudo apt install steamcmd")}>Copy</button>
          <p>Launch SteamCMD by typing <code>steamcmd</code> in your terminal.</p>
        </article>

        <article>
          <h3>Uninstalling SteamCMD</h3>
          <p>If you want to remove SteamCMD, use:</p>
          <pre className="code-block">
{`sudo apt remove --purge steamcmd
sudo apt autoremove`}
          </pre>
          <button className="dashboard-btn" onClick={() => copyToClipboard("sudo apt remove --purge steamcmd\nsudo apt autoremove")}>Copy</button>
        </article>

        <article>
          <h3>Updating SteamCMD</h3>
          <p>SteamCMD updates itself automatically on launch. Just run:</p>
          <pre className="code-block">steamcmd</pre>
          <button className="dashboard-btn" onClick={() => copyToClipboard("steamcmd")}>Copy</button>
        </article>

        <article>
          <h3>Updating Project Zomboid Server Files</h3>
          <p>To update your Project Zomboid server, run:</p>
          <pre className="code-block">
{`steamcmd +login anonymous +force_install_dir /path/to/pzserver +app_update 380870 validate +quit`}
          </pre>
          <button
            className="dashboard-btn"
            onClick={() =>
              copyToClipboard(
                "steamcmd +login anonymous +force_install_dir /path/to/pzserver +app_update 380870 validate +quit"
              )
            }
          >
            Copy
          </button>
          <p>Replace <code>/path/to/pzserver</code> with your actual server install directory.</p>
        </article>
      </section>
    </div>
  );
};

export default SetupSteamCMD;
