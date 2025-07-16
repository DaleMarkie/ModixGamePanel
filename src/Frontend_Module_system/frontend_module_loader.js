// Frontend Module Loader for Modix
// Place this file in module_system/frontend_module_loader.js
// This loader fetches enabled modules from the backend and dynamically imports their frontend components.

// Example usage: Call loadEnabledModules() on app startup

export async function loadEnabledModules(apiBaseUrl = "/api") {
  console.log("[Modix] Calling API for enabled modules:", `${apiBaseUrl}/modules/enabled`);
  // Fetch enabled modules from backend
  const res = await fetch(`${apiBaseUrl}/modules/enabled`);
  console.log("[Modix] API response status:", res.status);
  if (!res.ok) throw new Error("Failed to fetch enabled modules");
  const { modules } = await res.json();
  console.log("[Modix] Modules received from API:", modules);

  // Dynamically import each module's frontend entry (if specified)
  const loadedModules = [];
  for (const mod of modules) {
    if (mod.frontend && mod.frontend.entry) {
      try {
        // Assumes entry is a relative path from /module_system/
        const modulePath = `/module_system/${mod.frontend.entry}`;
        console.log(`[Modix] Importing module: ${mod.name} from`, modulePath);
        const imported = await import(/* @vite-ignore */ modulePath);
        loadedModules.push({
          name: mod.name,
          component: imported.default || imported,
          ...mod
        });
        console.log(`[Modix] Successfully loaded module: ${mod.name}`);
      } catch (e) {
        console.error(`Failed to load frontend for module ${mod.name}:`, e);
      }
    } else {
      console.log(`[Modix] Skipping module (no frontend entry):`, mod.name);
    }
  }
  console.log("[Modix] Loaded modules:", loadedModules);
  return loadedModules;
}

// Optionally, you can add helpers to register routes, menu items, etc. based on loadedModules.
