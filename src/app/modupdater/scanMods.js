const fs = require("fs");
const path = require("path");

const modsRoot = path.resolve(__dirname, "mods"); // YOUR mods folder path here

function getLatestEditedFileInfo(dir) {
  let latestFile = null;
  let latestTime = 0;

  function scan(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        scan(fullPath);
      } else {
        const stat = fs.statSync(fullPath);
        if (stat.mtimeMs > latestTime) {
          latestTime = stat.mtimeMs;
          latestFile = fullPath;
        }
      }
    }
  }

  scan(dir);

  if (!latestFile) return null;

  return {
    file: path.relative(dir, latestFile).replace(/\\/g, "/"),
    time: new Date(latestTime).toLocaleString(),
  };
}

function scanMods() {
  if (!fs.existsSync(modsRoot)) {
    console.error("Mods folder not found:", modsRoot);
    process.exit(1);
  }

  const mods = [];
  const modFolders = fs
    .readdirSync(modsRoot, { withFileTypes: true })
    .filter((f) => f.isDirectory());

  for (const modFolder of modFolders) {
    const modPath = path.join(modsRoot, modFolder.name);
    const latest = getLatestEditedFileInfo(modPath);

    mods.push({
      name: modFolder.name,
      folder: modPath,
      lastEditedFile: latest ? latest.file : "No files",
      lastEditedTime: latest ? latest.time : "N/A",
    });
  }

  return mods;
}

const mods = scanMods();

fs.writeFileSync(
  path.resolve(__dirname, "mods-info.json"),
  JSON.stringify(mods, null, 2)
);

console.log("mods-info.json generated.");
