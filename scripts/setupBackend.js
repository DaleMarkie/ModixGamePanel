const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const backendPath = path.join(__dirname, "../backend");
const requirementsFile = path.join(backendPath, "requirements.txt");

console.log("🔧 Setting up backend...");

if (fs.existsSync(requirementsFile)) {
  try {
    const venvPath = path.join(backendPath, "venv");
    if (!fs.existsSync(venvPath)) {
      console.log("📦 Creating virtual environment...");
      execSync("python3 -m venv venv || python -m venv venv", { cwd: backendPath, stdio: "inherit" });
    }

    console.log("📥 Installing backend dependencies...");
    const pip = process.platform === "win32"
      ? "venv\\Scripts\\pip"
      : "venv/bin/pip";
    execSync(`${pip} install -r requirements.txt`, { cwd: backendPath, stdio: "inherit" });

    // Save python path for later use
    const pythonPath = process.platform === "win32"
      ? "backend\\venv\\Scripts\\python"
      : "backend/venv/bin/python";
    fs.writeFileSync(path.join(__dirname, "../.backendrc"), pythonPath);

    console.log("✅ Backend setup completed!");
  } catch (error) {
    console.error("❌ Failed to set up backend:", error);
    process.exit(1);
  }
} else {
  console.log("⚠️ No backend/requirements.txt found. Skipping backend setup.");
}
