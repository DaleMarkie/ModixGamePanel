"use client";

import dynamic from "next/dynamic";
import React, { ComponentType } from "react";
import {
  importMap as moduleImportMap,
  ModuleImportFn,
} from "../moduleImportMap";

interface DynamicModuleClientProps {
  entry: string;
}

const DynamicModuleClient: React.FC<DynamicModuleClientProps> = ({ entry }) => {
  const importFn: ModuleImportFn | undefined = moduleImportMap[entry];

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
      </div>
    );
  }

  const loadModule = async (): Promise<ComponentType> => {
    try {
      const mod = await importFn();
      return mod.default;
    } catch (err) {
      console.error("DynamicModuleClient: import failed", entry, err);
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

export default DynamicModuleClient;
