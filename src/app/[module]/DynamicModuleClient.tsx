"use client";
import dynamic from "next/dynamic";
import React from "react";


export default function DynamicModuleClient({ entry }: { entry: string }) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { importMap } = require("../moduleImportMap.js");
  // Debug: log all importMap keys and the entry value
  if (typeof window !== "undefined") {
    console.log("[DynamicModuleClient] importMap keys:", Object.keys(importMap));
    console.log("[DynamicModuleClient] requested entry:", entry);
  }
  const importFn = importMap[entry];

  if (!importFn) {
    console.error("DynamicModulePage: No import function for entry", entry);
    if (typeof window !== "undefined") {
      console.warn("[DynamicModuleClient] importMap keys:", Object.keys(importMap));
      console.warn("[DynamicModuleClient] requested entry:", entry);
    }
    return (
      <div style={{ color: 'red', padding: 16, background: '#222', borderRadius: 8 }}>
        <b>Module frontend file not found:</b> <code>{entry}</code>
        <br />
        This module does not have a frontend file at the expected path.<br />
        Please check that <code>{entry}</code> exists and is included in the import map.<br />
        If you just added the file, try regenerating the import map and restarting the dev server.
      </div>
    );
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
