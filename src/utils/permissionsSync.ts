// src/utils/permissionsSync.ts
// Utility to periodically check if JWT permissions match backend permissions
// and trigger a refresh or logout if they differ.

import { authFetch } from "./authFetch";

interface PermissionObject {
  permission: string;
}

interface BackendResponse {
  direct_permissions?: PermissionObject[];
  role_permissions?: PermissionObject[];
}

export async function getBackendPermissions(): Promise<string[] | null> {
  try {
    const res = await authFetch("/api/me");
    if (!res.ok) return null;

    const data: BackendResponse = await res.json();
    const direct = (data.direct_permissions || []).map((p) => p.permission);
    const role = (data.role_permissions || []).map((p) => p.permission);
    return Array.from(new Set([...direct, ...role]));
  } catch {
    return null;
  }
}

export function getJwtPermissions(token: string): string[] | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as {
      permissions?: string[];
    };
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

  if (!backendPerms || !jwtPerms) {
    return { match: false, backend: backendPerms, jwt: jwtPerms };
  }

  const match =
    backendPerms.length === jwtPerms.length &&
    backendPerms.every((p) => jwtPerms.includes(p));
  return { match, backend: backendPerms, jwt: jwtPerms };
}
