// src/utils/authFetch.ts

// Auth fetch util (no Authorization header, rely on HttpOnly cookie)
export function authFetch(input: RequestInfo, init: RequestInit = {}) {
  // Always include credentials unless explicitly set otherwise
  const fetchOptions = { ...init, credentials: init.credentials || "include" };
  if (typeof window !== "undefined") {
    console.log("[authFetch] Fetching:", input);
    console.log("[authFetch] Options:", fetchOptions);
    console.log("[authFetch] credentials:", fetchOptions.credentials);
    console.log("[authFetch] document.cookie:", document.cookie);
  }
  return fetch(input, fetchOptions);
}