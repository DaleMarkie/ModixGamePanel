"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

// Type for module metadata (adjust as needed)
export type Module = {
  name: string;
  version: string;
  description: string;
  author: string;
  website?: string;
  permissions?: string[];
  frontend?: {
    routes?: Array<{
      path: string;
      component: string;
      entry: string;
      permission?: string;
    }>;
    nav_items?: Array<{
      label: string;
      path: string;
      icon?: string;
      permission?: string;
    }>;
  };
  backend?: {
    router?: string;
  };
};

export type ModuleContextType = {
  modules: Module[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export const useModules = () => {
  const ctx = useContext(ModuleContext);
  if (!ctx) throw new Error("useModules must be used within ModuleProvider");
  return ctx;
};

export const ModuleProvider = ({ children }: { children: React.ReactNode }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/modules/enabled");
      console.debug("ModuleProvider: fetch status", res.status);
      if (!res.ok) throw new Error("Failed to fetch modules");
      const data = await res.json();
      console.debug("ModuleProvider: API response", data);
      // If API returns { modules: [...] }, extract modules
      if (data && Array.isArray(data.modules)) {
        setModules(data.modules);
      } else if (Array.isArray(data)) {
        setModules(data);
      } else {
        setModules([]);
        console.warn("ModuleProvider: Unexpected API response format", data);
      }
    } catch (e: any) {
      setError(e.message);
      setModules([]);
      console.error("ModuleProvider: fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  return (
    <ModuleContext.Provider value={{ modules, loading, error, refresh: fetchModules }}>
      {children}
    </ModuleContext.Provider>
  );
};
