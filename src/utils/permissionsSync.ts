// src/utils/permissionsSync.ts
// Utility to periodically check if JWT permissions match backend permissions
// and trigger a refresh or logout if they differ.

import { authFetch } from "./authFetch";

export async function getBackendPermissions(): Promise<string[] | null> {
  try {
    const res = await authFetch("/api/me");
    if (!res.ok) return null;
    const data = await res.json();
    // Combine direct and role permissions
    const direct = (data.direct_permissions || []).map((p: any) => p.permission);
    const role = (data.role_permissions || []).map((p: any) => p.permission);
    return Array.from(new Set([...direct, ...role]));
  } catch {
    return null;
  }
}

export function getJwtPermissions(token: string): string[] | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Array.isArray(payload.permissions) ? payload.permissions : null;
  } catch {
    return null;
  }
}

export async function checkPermissionsSync(jwtToken: string): Promise<{
  match: boolean;
  backend: string[] | null;
  jwt: string[] | null;
}> {
  const backendPerms = await getBackendPermissions();
  const jwtPerms = getJwtPermissions(jwtToken);
  if (!backendPerms || !jwtPerms) return { match: false, backend: backendPerms, jwt: jwtPerms };
  const match = backendPerms.length === jwtPerms.length && backendPerms.every(p => jwtPerms.includes(p));
  return { match, backend: backendPerms, jwt: jwtPerms };
}

// Example usage:
// setInterval(async () => {
//   const jwt = getCookie('access_token');
//   if (!jwt) return;
//   const { match } = await checkPermissionsSync(jwt);
//   if (!match) {
//     // Trigger refresh or logout
//   }
// }, 5 * 60 * 1000); // every 5 minutes
