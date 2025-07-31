import React, { createContext, useContext, ReactNode } from 'react';

const PermissionsContext = createContext<string[]>([]);

export const PermissionsProvider = ({ permissions, children }: { permissions: string[]; children: ReactNode }) => (
  <PermissionsContext.Provider value={permissions}>
    {children}
  </PermissionsContext.Provider>
);

export const usePermissions = () => useContext(PermissionsContext);
