
"use client";
import { apiHandler } from "../utils/apiHandler";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { usePermissionsSync } from "../utils/usePermissionsSync";

// Types for user and context
interface User {
  id?: string | number;
  username: string;
  email?: string;
  name?: string;
  is_active?: boolean;
  avatar?: string;
  roles?: string[];
  direct_permissions?: Array<{
    permission: string;
    value: string;
    scope?: string;
    container_id?: number;
  }>;
  role_permissions?: Array<{
    permission: string;
    value: string;
    scope?: string;
    container_id?: number;
  }>;
}

interface UserContextType {
  user: User | null;
  authenticated: boolean;
  loading: boolean;
  refresh: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  authenticated: false,
  loading: true,
  refresh: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [authenticated, setAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("user");
    }
    return false;
  });
  // Helper to clear user state and cookies
  const logoutUser = () => {
    setUser(null);
    setAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      // Clear cookies (best effort, HttpOnly cookies can't be cleared from JS)
      document.cookie = "access_token=; Max-Age=0; path=/;";
      document.cookie = "refresh_token=; Max-Age=0; path=/;";
    }
  }

  // Removed duplicate/incorrect fetchUser
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    let triedRefresh = false;
    let statusData;
    try {
      statusData = await apiHandler("/api/auth/status", { cacheTtlMs: 10000 });
      if (!statusData.authenticated) {
        // Try refresh if not authenticated
        await apiHandler("/api/auth/refresh", { fetchInit: { method: "POST" }, skipCache: true });
        // Try status again
      // fetchUser(); // Removed duplicate call
      }
      setAuthenticated(!!statusData.authenticated);
      if (statusData.authenticated) {
        const meData = await apiHandler("/api/auth/me", { cacheTtlMs: 10000 });
        setUser(meData);
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(meData));
        }
      } else {
        setUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
        }
      }
    } catch (err) {
      setUser(null);
      setAuthenticated(false);
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  };


  // Check permissions sync on every mount (page refresh) and periodically
  usePermissionsSync({
    onMismatch: () => {
      // Permissions changed, force user refresh and notify
      toast.info("Your permissions have changed. Refreshing session.");
      fetchUser();
      fetchUser();
    },
    intervalMs: 5 * 60 * 1000, // every 5 minutes
  });

  useEffect(() => {
    // On mount, check permissions immediately
    (async () => {
      const getCookie = (name: string) => {
        if (typeof document === "undefined") return null;
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
      };
      const jwt = getCookie("access_token");
      if (jwt) {
        const { match } = await import("../utils/permissionsSync").then(m => m.checkPermissionsSync(jwt));
        if (match) {
          toast.info("Your permissions have changed. Refreshing session.");
          fetchUser();
        }
      } else {
        fetchUser();
      }
    })();
  }, []);

  return (
    <UserContext.Provider value={{ user, authenticated: !!authenticated, loading, refresh: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
