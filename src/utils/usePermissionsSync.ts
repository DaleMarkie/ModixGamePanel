// src/utils/usePermissionsSync.ts
import { useEffect } from "react";
import { checkPermissionsSync } from "./permissionsSync";

// Helper to get cookie value by name
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function usePermissionsSync({ intervalMs = 5 * 60 * 1000, onMismatch }: {
  intervalMs?: number;
  onMismatch?: (result: { match: boolean; backend: string[] | null; jwt: string[] | null }) => void;
} = {}) {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    async function check() {
      const jwt = getCookie("access_token");
      if (!jwt) return;
      const result = await checkPermissionsSync(jwt);
      if (!result.match && onMismatch) {
        onMismatch(result);
      }
    }
    check();
    timer = setInterval(check, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, onMismatch]);
}
