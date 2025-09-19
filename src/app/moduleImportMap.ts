// src/app/moduleImportMap.ts
import type { ComponentType } from "react";

export type ModuleImportFn = () => Promise<{ default: ComponentType<unknown> }>;

export const importMap: Record<string, ModuleImportFn> = {
  "Core/DiscordWebhooks/frontend/page.tsx": () =>
    import("../../module_system/Core/DiscordWebhooks/frontend/page.tsx"),
  "Core/FileBrowser/frontend/page.tsx": () =>
    import("../../module_system/Core/FileBrowser/frontend/page.tsx"),
  "Core/ModManager/frontend/page.tsx": () =>
    import("../../module_system/Core/ModManager/frontend/page.tsx"),
  "Core/ModUpdater/frontend/page.tsx": () =>
    import("../../module_system/Core/ModUpdater/frontend/page.tsx"),
  "Core/RBAC/frontend/page.tsx": () =>
    import("../../module_system/Core/RBAC/frontend/page.tsx"),
  "Core/TestModule/frontend/page.tsx": () =>
    import("../../module_system/Core/TestModule/frontend/page.tsx"),

  // Workshop is now fully in src/app/Workshop
  "Workshop/frontend/page.tsx": () => import("./Workshop/page"),
  "Terminal/frontend/page.tsx": () => import("./Terminal/page"),

  "Optional/Backup/Frontend/page.tsx": () =>
    import("../../module_system/Optional/Backup/Frontend/page.tsx"),
};
