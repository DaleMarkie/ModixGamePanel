"use client";

import React, { Suspense } from "react";
import { importMap } from "../moduleImportMap";

// Maps route names to importMap keys
const ROUTE_TO_MODULE: Record<string, string> = {
  workshop: "Workshop/frontend/page.tsx",
  discord: "Core/DiscordWebhooks/frontend/page.tsx",
  filebrowser: "Core/FileBrowser/frontend/page.tsx",
  modmanager: "Core/ModManager/frontend/page.tsx",
  modupdater: "Core/ModUpdater/frontend/page.tsx",
  rbac: "Core/RBAC/frontend/page.tsx",
  terminal: "Core/Terminal/frontend/page.tsx",
  testmodule: "Core/TestModule/frontend/page.tsx",
};

interface ModulePageProps {
  params: { module: string };
}

export default function ModuleFallbackPage({ params }: ModulePageProps) {
  const { module } = params;

  const moduleKey = ROUTE_TO_MODULE[module.toLowerCase()];
  if (!moduleKey || !(moduleKey in importMap)) {
    return (
      <div style={{ padding: 20 }}>Module &quot;{module}&quot; not found.</div>
    );
  }

  const ModuleComponent = React.lazy(importMap[moduleKey]);

  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading {module}...</div>}>
      <ModuleComponent />
    </Suspense>
  );
}
