"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

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
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    let triedRefresh = false;
    let statusData;
    let statusRes;
    let meRes;
    let meData;
    try {
      statusRes = await fetch("/api/auth/status");
      statusData = await statusRes.json();
      if (!statusData.authenticated) {
        // Try refresh if not authenticated
        const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
        if (refreshRes.ok) {
          triedRefresh = true;
          // Try status again
          statusRes = await fetch("/api/auth/status");
          statusData = await statusRes.json();
        }
      }
      setAuthenticated(!!statusData.authenticated);
      if (statusData.authenticated) {
        meRes = await fetch("/api/auth/me");
        meData = await meRes.json();
        setUser(meData);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
      setAuthenticated(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, authenticated, loading, refresh: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
