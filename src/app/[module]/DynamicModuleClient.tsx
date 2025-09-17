"use client";

import dynamic from "next/dynamic";
import React from "react";
import { importMap as moduleImportMap } from "../moduleImportMap";

interface DynamicModuleClientProps {
  entry: string;
}

interface ModuleImport {
  default: React.ComponentType<unknown>;
}

const DynamicModuleClient: React.FC<DynamicModuleClientProps> = ({ entry }) => {
  const importFn = moduleImportMap[entry];

  if (!importFn) {
    return (
      <div
        style={{
          color: "red",
          padding: 16,
          background: "#222",
          borderRadius: 8,
        }}
      >
        <b>Module frontend file not found:</b> <code>{entry}</code>
        <br />
        This module does not have a frontend file at the expected path.
        <br />
        Please check that <code>{entry}</code> exists and is included in the
        import map.
        <br />
        If you just added the file, try regenerating the import map and
        restarting the dev server.
      </div>
    );
  }

  // Wrap dynamic import in a named function component to satisfy react/display-name
  const loadModule = async (): Promise<React.ComponentType> => {
    try {
      const mod: ModuleImport = await importFn();
      return mod.default;
    } catch (err) {
      console.error("DynamicModuleClient: import failed", entry, err);
      // Return a named fallback component
      const Fallback: React.FC = () => (
        <div>Failed to load module frontend: {entry}</div>
      );
      Fallback.displayName = `Fallback_${entry}`;
      return Fallback;
    }
  };

  const ModuleComponent = dynamic(loadModule, { ssr: false });

  return <ModuleComponent />;
};

// Add display name
DynamicModuleClient.displayName = "DynamicModuleClient";

export default DynamicModuleClient;
