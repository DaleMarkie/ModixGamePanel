"use client";
import React from "react";
import { useModules } from "../ModuleContext";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

export default function DynamicModulePage() {
  const { modules = [], loading } = useModules();

  // At startup, log all available modules and their entry points
  React.useEffect(() => {
    if (Array.isArray(modules)) {
      console.debug("DynamicModulePage: All available modules:", modules.map(m => ({ name: m.name, entry: (m as any).entry || m.frontend?.routes?.[0]?.entry })));
    }
  }, [modules]);
  const params = useParams();
  const moduleName = typeof params.module === "string" ? params.module : Array.isArray(params.module) ? params.module[0] : "";

  // Debug: log all modules and the requested module name
  console.debug("DynamicModulePage: modules", modules);
  console.debug("DynamicModulePage: moduleName", moduleName);

  // Find the module manifest safely
  const mod = Array.isArray(modules)
    ? modules.find((m) => typeof m.name === "string" && m.name.toLowerCase() === moduleName.toLowerCase())
    : undefined;
  console.debug("DynamicModulePage: selected mod", mod);

  if (loading) return <div>Loading...</div>;
  if (!mod) return <div>Module not found or disabled.</div>;

  // Get the entry path for the frontend component (relative to project root)
  let entry = (mod as any).entry || mod.frontend?.routes?.[0]?.entry;
  // If backend provides only the module root, append the default frontend entry
  // Use the auto-generated import map
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { importMap } = require("../moduleImportMap.js");
  if (typeof entry === "string" && !entry.includes("frontend/page")) {
    // Try .tsx first, fallback to .js if needed
    const tsxPath = entry.replace(/\/$/, "") + "/frontend/page.tsx";
    const jsPath = entry.replace(/\/$/, "") + "/frontend/page.js";
    entry = importMap[tsxPath] ? tsxPath : (importMap[jsPath] ? jsPath : tsxPath);
    console.debug("DynamicModulePage: constructed entry path", entry);
  } else {
    console.debug("DynamicModulePage: entry path", entry);
  }
  if (!entry) return <div>No frontend entry defined for this module.</div>;


  const importFn = importMap[entry];
  if (!importFn) {
    console.error("DynamicModulePage: No import function for entry", entry);
    return <div>Failed to load module frontend: {entry}</div>;
  }

  const ModuleComponent = dynamic(
    () =>
      importFn()
        .then((mod) => {
          console.debug("DynamicModulePage: successfully imported", entry, mod);
          return mod;
        })
        .catch((err) => {
          console.error("DynamicModulePage: import failed", entry, err);
          return () => <div>Failed to load module frontend: {entry}</div>;
        }),
    { ssr: false }
  );

  return <ModuleComponent />;
}