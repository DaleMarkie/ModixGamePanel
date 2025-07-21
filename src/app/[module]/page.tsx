"use client";
import React from "react";
import { useModules } from "../ModuleContext";
import dynamic from "next/dynamic";
import { useParams, notFound } from "next/navigation";

export default function DynamicModulePage() {
  const { modules = [], loading } = useModules();
  const params = useParams();
  const moduleName = typeof params.module === "string" ? params.module : Array.isArray(params.module) ? params.module[0] : "";
  const [mod, setMod] = React.useState<any>(undefined);

  // Import modix config
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const modixConfig = require("../../../backend/modix_config/modix_config.json");

  React.useEffect(() => {
    if (Array.isArray(modules)) {
      if (modixConfig?.debug) {
        console.debug("DynamicModulePage: All available modules:", modules.map(m => ({ name: m.name, entry: (m as any).entry || m.frontend?.routes?.[0]?.entry })));
        console.debug("DynamicModulePage: modules array", modules);
        console.debug("DynamicModulePage: requested moduleName", moduleName);
        console.debug("DynamicModulePage: all module names", modules.map(m => m.name));
      }
      const foundMod = modules.find((m) => typeof m.name === "string" && m.name.toLowerCase() === moduleName.toLowerCase());
      setMod(foundMod);
      if (modixConfig?.debug) {
        console.debug("DynamicModulePage: selected mod", foundMod);
      }
    }
  }, [modules, moduleName]);

  React.useEffect(() => {
    if (!loading && !mod) {
      if (modixConfig?.debug) {
        console.error(`DynamicModulePage: 404 - Module '${moduleName}' not found or disabled.`);
      }
      if (typeof window !== "undefined") {
        window.history.replaceState({}, '', '/404');
      }
    }
  }, [mod, loading, moduleName, modixConfig]);

  if (loading) return <div>Loading...</div>;
  if (!mod && !loading) {
    notFound();
  }

  // Get the entry path for the frontend component (relative to project root)
  let entry = (mod && ((mod as any).entry || mod.frontend?.routes?.[0]?.entry)) ?? undefined;
  // If backend provides only the module root, append the default frontend entry
  // Use the auto-generated import map
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { importMap } = require("../moduleImportMap.js");
  if (typeof entry === "string" && !entry.includes("frontend/page")) {
    const tsxPath = entry.replace(/\/$/, "") + "/frontend/page.tsx";
    const jsPath = entry.replace(/\/$/, "") + "/frontend/page.js";
    entry = importMap[tsxPath] ? tsxPath : (importMap[jsPath] ? jsPath : tsxPath);
    console.debug("DynamicModulePage: constructed entry path", entry);
  } else {
    console.debug("DynamicModulePage: entry path", entry);
  }
  if (!entry) {
    // Logistics handling: module is valid but has no frontend
    return (
      <div style={{textAlign: 'center', marginTop: '4rem'}}>
        <h1>Module Loaded (Backend Only)</h1>
        <p>The module <strong>{mod?.name ?? moduleName}</strong> does not provide a frontend UI.<br />
        All logic and features for this module are handled on the backend.</p>
        <p style={{color: '#888', marginTop: '2rem'}}>If you expect a UI for this module, check its manifest or contact the module author.</p>
      </div>
    );
  }

  const importFn = importMap[entry];
  if (!importFn) {
    console.error("DynamicModulePage: No import function for entry", entry);
    return <div>Failed to load module frontend: {entry}</div>;
  }

  const ModuleComponent = dynamic(
    () =>
      importFn()
        .then((mod: any) => {
          console.debug("DynamicModulePage: successfully imported", entry, mod);
          return mod;
        })
        .catch((err: any) => {
          console.error("DynamicModulePage: import failed", entry, err);
          return () => <div>Failed to load module frontend: {entry}</div>;
        }),
    { ssr: false }
  );

  return <ModuleComponent />;
}