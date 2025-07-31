import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

// Loads permissions for a given route from the module's YAML file
export function getPermissionsForRoute(route: string): string[] {
  const moduleName = route.split('/')[1];
  const baseDirs = ['Core', 'Optional', 'Game_Modules'];
  for (const base of baseDirs) {
    const moduleDir = path.join(process.cwd(), 'module_system', base, moduleName);
    const permYaml = path.join(moduleDir, 'permissions.yaml');
    const moduleYaml = path.join(moduleDir, 'module.yaml');
    // 1. Try permissions.yaml (legacy)
    if (fs.existsSync(permYaml)) {
      const doc = yaml.load(fs.readFileSync(permYaml, 'utf8')) as any;
      return doc?.routes?.[route] || [];
    }
    // 2. Try module.yaml (modern)
    if (fs.existsSync(moduleYaml)) {
      const doc = yaml.load(fs.readFileSync(moduleYaml, 'utf8')) as any;
      // Find route in frontend.routes
      const routes = doc?.frontend?.routes || [];
      for (const r of routes) {
        if (r.path === `/${moduleName}` || r.path === route) {
          if (r.permission) {
            // Prefix with module name (lowercase)
            return [`${moduleName.toLowerCase()}_${r.permission}`];
          }
        }
      }
    }
  }
  return [];
}
