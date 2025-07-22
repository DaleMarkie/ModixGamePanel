import React, { createContext, useContext, useState } from "react";

interface ContainerContextType {
  selectedContainer: string;
  setSelectedContainer: (container: string) => void;
}

const defaultContainer = "pz-prod-container-05";

const ContainerContext = createContext<ContainerContextType>({
  selectedContainer: defaultContainer,
  setSelectedContainer: () => {},
});

export const ContainerProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedContainer, setSelectedContainer] = useState<string>(defaultContainer);

  return (
    <ContainerContext.Provider value={{ selectedContainer, setSelectedContainer }}>
      {children}
    </ContainerContext.Provider>
  );
};

export const useContainer = () => useContext(ContainerContext);
