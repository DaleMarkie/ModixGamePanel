"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiHandler } from "../utils/apiHandler";

interface ContainerContextType {
  selectedContainer: string;
  setSelectedContainer: (container: string) => void;
  containers: string[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const defaultContainer = "";

const ContainerContext = createContext<ContainerContextType>({
  selectedContainer: defaultContainer,
  setSelectedContainer: () => {},
  containers: [],
  loading: false,
  error: null,
  refresh: () => {},
});

export const ContainerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedContainer, setSelectedContainerState] = useState<string>(
    () => {
      if (typeof window !== "undefined") {
        return localStorage.getItem("selectedContainer") || defaultContainer;
      }
      return defaultContainer;
    }
  );
  const [containers, setContainers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContainers = async () => {
    setLoading(true);
    setError(null);
    try {
      // You can adjust cacheTtlMs as needed
      const data = await apiHandler<string[]>("/api/docker/containers", {
        cacheTtlMs: 60000,
      });
      setContainers(data);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to fetch containers");
      }
      setContainers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedContainer", selectedContainer);
    }
  }, [selectedContainer]);

  const setSelectedContainer = (container: string) => {
    setSelectedContainerState(container);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedContainer", container);
    }
  };

  return (
    <ContainerContext.Provider
      value={{
        selectedContainer,
        setSelectedContainer,
        containers,
        loading,
        error,
        refresh: fetchContainers,
      }}
    >
      {children}
    </ContainerContext.Provider>
  );
};

export const useContainer = () => useContext(ContainerContext);
