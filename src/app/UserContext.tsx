"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiHandler } from "../utils/apiHandler";

export interface User {
  username: string;
  email?: string;
  active: boolean;
  created_at: string;
  tfa_enabled: boolean;
  last_login: string;
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
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const statusData = await apiHandler("/api/auth/status", {
        headers: { Authorization: token },
      });
      setAuthenticated(!!statusData.authenticated);

      if (statusData.authenticated) {
        const meData = await apiHandler("/api/auth/me", {
          headers: { Authorization: token },
        });
        setUser(meData);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, authenticated, loading, refresh: fetchUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
