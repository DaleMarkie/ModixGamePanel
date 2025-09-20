// src/app/UserContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  username: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  license_code?: string;
  last_login?: string;
  [key: string]: any;
}

interface UserContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
  refreshUser: async () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setUser(null);
        return;
      }

      const res = await fetch("/api/auth/me", {
        headers: { Authorization: token },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user || data); // support both {user} and direct response
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
