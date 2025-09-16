// src/utils/authFetch.ts

// Auth fetch util (no Authorization header, rely on HttpOnly cookie)
export function authFetch(input: RequestInfo, init: RequestInit = {}) {
  // Always include credentials unless explicitly set otherwise
  const fetchOptions = { ...init, credentials: init.credentials || "include" };
  if (typeof window !== "undefined") {
    //console.log("[authFetch] Fetching:", input);
    //console.log("[authFetch] Options:", fetchOptions);
    //console.log("[authFetch] credentials:", fetchOptions.credentials);
    //console.log("[authFetch] document.cookie:", document.cookie);
  }
  return fetch(input, fetchOptions);
}

// Utility to get a cookie value by name
export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : undefined;
}
