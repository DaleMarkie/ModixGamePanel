// src/app/[module]/page.tsx
"use client";

import DynamicModuleClient from "./DynamicModuleClient";

// Minimal module page that just renders the client
export default function DynamicModulePage() {
  // For now, we can pass a default entry or show a placeholder
  const defaultEntry = "Core/TestModule/frontend/page.tsx";

  return <DynamicModuleClient entry={defaultEntry} />;
}
