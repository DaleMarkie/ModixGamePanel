// --- Server Component ---
// Only this part runs on the server and can import Node modules
import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import DynamicModulePageClient from "./DynamicModulePageClient";
import { importMap } from "../moduleImportMap.js"; // replaced require with import

interface ModuleYaml {
  name?: string;
  nickname?: string;
  frontend?: {
    routes?: Array<{
      entry?: string;
      permission?: string | string[];
    }>;
  };
}

export default async function DynamicModulePage({
  params,
}: {
  params: { module: string };
}) {
  const moduleParam = params.module;

  let entry: string | null = null;
  let requiredPerms: string[] = [];
  let moduleDisplayName: string | null = null;
  let moduleNickname: string | null = null;

  const moduleRoots = [
    path.join(process.cwd(), "module_system", "Core"),
    path.join(process.cwd(), "module_system", "Optional"),
    path.join(process.cwd(), "module_system", "Game_Modules"),
  ];

  for (const root of moduleRoots) {
    try {
      const dirents = fs.readdirSync(root, { withFileTypes: true });
      for (const dirent of dirents) {
        if (
          dirent.isDirectory() &&
          dirent.name.toLowerCase() === moduleParam.toLowerCase()
        ) {
          const yamlPath = path.join(root, dirent.name, "module.yaml");
          if (fs.existsSync(yamlPath)) {
            const yamlContent = fs.readFileSync(yamlPath, "utf8");
            const parsed = yaml.load(yamlContent) as ModuleYaml;

            if (parsed?.name) moduleDisplayName = parsed.name;
            if (parsed?.nickname) moduleNickname = parsed.nickname;

            const routes = parsed?.frontend?.routes;
            if (routes && Array.isArray(routes)) {
              for (const route of routes) {
                if (route.entry && importMap[route.entry]) {
                  entry = route.entry;
                  // Extract permissions
                  const base = (
                    moduleNickname ||
                    moduleDisplayName ||
                    moduleParam
                  ).toLowerCase();
                  if (route.permission) {
                    const perms = Array.isArray(route.permission)
                      ? route.permission
                      : [route.permission];
                    requiredPerms = perms.map((perm) =>
                      perm.startsWith(base + "_") ? perm : base + "_" + perm
                    );
                  } else {
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
    } catch {
      // safely ignore errors
    }
    if (entry) break;
  }

  // Fallback logic if entry not found
  if (
    !entry &&
    typeof moduleParam === "string" &&
    !moduleParam.includes("frontend/page")
  ) {
    const capitalizeFirst = (s: string) =>
      s.charAt(0).toUpperCase() + s.slice(1);
    const moduleName = capitalizeFirst(moduleParam);
    const prefixes = ["Core", "Optional", "Game_Modules"];
    for (const prefix of prefixes) {
      const tsxKey = path.join(prefix, moduleName, "frontend/page.tsx");
      const jsKey = path.join(prefix, moduleName, "frontend/page.js");
      if (importMap[tsxKey]) {
        entry = tsxKey;
        break;
      } else if (importMap[jsKey]) {
        entry = jsKey;
        break;
      }
    }

    if (!entry) {
      const tsxPath = path.join(
        moduleParam.replace(/\/$/, ""),
        "frontend/page.tsx"
      );
      const jsPath = path.join(
        moduleParam.replace(/\/$/, ""),
        "frontend/page.js"
      );
      entry = importMap[tsxPath]
        ? tsxPath
        : importMap[jsPath]
        ? jsPath
        : tsxPath;
    }
  }

  if (!entry) {
    return (
      <div
        style={{
          color: "orange",
          padding: 16,
          background: "#222",
          borderRadius: 8,
        }}
      >
        <b>No frontend entry defined for this module.</b>
        <br />
        Make sure the entry value exists and is under Core, Optional, or
        GameModules.
      </div>
    );
  }

  const displayName = moduleNickname || moduleDisplayName || moduleParam;

  // Server-side debug logging
  console.log("[DynamicModulePage] resolved entry:", entry);

  return (
    <DynamicModulePageClient
      moduleParam={moduleParam}
      entry={entry}
      requiredPerms={requiredPerms}
      moduleDisplayName={displayName}
    />
  );
}
