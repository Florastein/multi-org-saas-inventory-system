"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Organization {
  id: number;
  name: string;
  slug: string;
  role: string;
}

interface AppContextType {
  user: User | null;
  currentOrganization: Organization | null;
  organizations: Organization[];
  setCurrentOrganization: (org: Organization) => void;
  setUser: (user: User) => void;
  setOrganizations: (orgs: Organization[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>({
    id: 1,
    name: "Admin User",
    email: "admin@acme.com"
  });
  
  const [organizations, setOrganizations] = useState<Organization[]>([
    { id: 1, name: "Acme Corp", slug: "acme-corp", role: "owner" },
    { id: 2, name: "TechStart Inc", slug: "techstart-inc", role: "member" }
  ]);
  
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(
    organizations[0] || null
  );

  return (
    <AppContext.Provider value={{
      user,
      currentOrganization,
      organizations,
      setCurrentOrganization,
      setUser,
      setOrganizations
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
