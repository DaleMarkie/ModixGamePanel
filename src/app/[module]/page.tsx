

// --- Server Component ---
// Only this part runs on the server and can import Node modules
import { getPermissionsForRoute } from "@/utils/permissionsLoader";
import path from "path";
import fs from "fs";
import yaml from "js-yaml";
const importMap = require("../moduleImportMap.js").importMap;

// Make sure the file exists at the correct path, or update the import path if needed
import DynamicModulePageClient from "./DynamicModulePageClient";

export default async function DynamicModulePage({ params }: { params: { module: string } }) {
  const awaitedParams = await params;
  const moduleParam = awaitedParams.module;

  // Try to resolve the correct importMap key by reading module.yaml for the entry field
let entry = null;
let foundKey = null;
let requiredPerms: string[] = [];
let moduleDisplayName: string | null = null;
let moduleNickname: string | null = null;
  // Search all possible module roots
  const moduleRoots = [
    path.join(process.cwd(), "module_system", "Core"),
    path.join(process.cwd(), "module_system", "Optional"),
    path.join(process.cwd(), "module_system", "Game_Modules"),
  ];
  for (const root of moduleRoots) {
    try {
      const dirents = fs.readdirSync(root, { withFileTypes: true });
      for (const dirent of dirents) {
        if (dirent.isDirectory() && dirent.name.toLowerCase() === moduleParam.toLowerCase()) {
          const yamlPath = path.join(root, dirent.name, "module.yaml");
          if (fs.existsSync(yamlPath)) {
            const yamlContent = fs.readFileSync(yamlPath, "utf8");
            const parsed = yaml.load(yamlContent) as any;
            if (parsed) {
              if (parsed.name) moduleDisplayName = parsed.name;
              if (parsed.nickname) moduleNickname = parsed.nickname;
            }
            if (parsed && parsed.frontend && parsed.frontend.routes && Array.isArray(parsed.frontend.routes)) {
              for (const route of parsed.frontend.routes) {
                if (route.entry && importMap[route.entry]) {
                  entry = route.entry;
                  foundKey = entry;
                  // Extract permission(s) from the matched route, or auto-generate if missing
                  const base = (moduleNickname || moduleDisplayName || moduleParam).toLowerCase();
                  if (route.permission) {
                    const perms = Array.isArray(route.permission) ? route.permission : [route.permission];
                    requiredPerms = perms.map((perm: string) => {
                      // If already prefixed, don't double-prefix
                      if (perm.startsWith(base + "_")) return perm;
                      return base + "_" + perm;
                    });
                  } else {
                    // No permission required for this entry, just login
                    requiredPerms = [];
                  }
                  break;
                }
              }
            }
          }
        }
        if (entry) break;
      }
    } catch (e) {
      // ignore
    }
    if (entry) break;
  }
  // fallback: try the original logic if nothing found
  if ((!entry || !requiredPerms.length) && typeof moduleParam === "string" && !moduleParam.includes("frontend/page")) {
    function capitalizeFirst(s: string) {
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
    const moduleName = capitalizeFirst(moduleParam);
    const prefixes = ["Core", "Optional", "Game_Modules"];
    for (const prefix of prefixes) {
      const tsxKey = path.join(prefix, moduleName, "frontend/page.tsx");
      const jsKey = path.join(prefix, moduleName, "frontend/page.js");
      if (importMap[tsxKey]) {
        entry = tsxKey;
        foundKey = tsxKey;
        break;
      } else if (importMap[jsKey]) {
        entry = jsKey;
        foundKey = jsKey;
        break;
      }
    }
    if (!entry) {
      const tsxPath = path.join(moduleParam.replace(/\/$/, ""), "frontend/page.tsx");
      const jsPath = path.join(moduleParam.replace(/\/$/, ""), "frontend/page.js");
      entry = importMap[tsxPath] ? tsxPath : (importMap[jsPath] ? jsPath : tsxPath);
      foundKey = entry;
    }
    // fallback: if no permission found, leave requiredPerms as empty (no permission required, just login)
  }

  if (!entry) {
    return (
      <div style={{ color: 'orange', padding: 16, background: '#222', borderRadius: 8 }}>
        <b>No frontend entry defined for this module.</b>
        <br />
        Make sure the entry value exists and is under Core, Optional, or GameModules.
      </div>
    );
  }

  // Debug: log the resolved entry key on the server
  console.log("[DynamicModulePage] resolved entry:", entry);
  // Pick display name: nickname > name > param
  const displayName = moduleNickname || moduleDisplayName || moduleParam;
  // Pass only the resolved entry and display name to the client
  return <DynamicModulePageClient moduleParam={moduleParam} entry={entry} requiredPerms={requiredPerms} moduleDisplayName={displayName} />;
}