// src/utils/apiHandler.ts
import { authFetch } from "./authFetch";

// In-memory cache for API responses
const apiCache = new Map<string, { data: any; expires: number }>();

export interface ApiHandlerOptions {
  skipCache?: boolean;
  skipAuth?: boolean;
  cacheTtlMs?: number; // default 30s
  fetchInit?: RequestInit;
}

/**
 * apiHandler: fetches data with optional caching and auth
 * @param input fetch URL or Request
 * @param options skipCache, skipAuth, cacheTtlMs, fetchInit
 */
export async function apiHandler<T = any>(
  input: RequestInfo,
  options: ApiHandlerOptions = {}
): Promise<T> {
  const {
    skipCache = false,
    skipAuth = false,
    cacheTtlMs = 30000, // 30 seconds default
    fetchInit = {},
  } = options;
  const cacheKey = typeof input === "string" ? input : (input as Request).url;
  // Only cache GET requests
  const isGet = !fetchInit.method || fetchInit.method.toUpperCase() === "GET";
  if (!skipCache && isGet) {
    const cached = apiCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
  }
  // Choose fetch function
  const fetchFn = skipAuth ? fetch : authFetch;
  const res = await fetchFn(input, fetchInit);
  if (!res.ok) throw new Error(`apiHandler: ${res.status} ${res.statusText}`);
  const data = await res.json();
  if (!skipCache && isGet) {
    apiCache.set(cacheKey, { data, expires: Date.now() + cacheTtlMs });
  }
  return data;
}
