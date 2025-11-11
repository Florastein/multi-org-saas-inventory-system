"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Organization {
  id: number;
  name: string;
  slug: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  organizations: Organization[];
  currentOrganization: Organization | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  setCurrentOrganization: (org: Organization) => void;
  refreshOrganizations: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/auth/me?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
        setOrganizations(data.organizations || []);
        
        // Restore current organization from localStorage
        const savedOrgId = localStorage.getItem('currentOrganizationId');
        if (savedOrgId && data.organizations) {
          const savedOrg = data.organizations.find((org: Organization) => org.id === parseInt(savedOrgId));
          if (savedOrg) {
            setCurrentOrganizationState(savedOrg);
          } else if (data.organizations.length > 0) {
            setCurrentOrganizationState(data.organizations[0]);
            localStorage.setItem('currentOrganizationId', data.organizations[0].id.toString());
          }
        } else if (data.organizations && data.organizations.length > 0) {
          setCurrentOrganizationState(data.organizations[0]);
          localStorage.setItem('currentOrganizationId', data.organizations[0].id.toString());
        }
      } else {
        localStorage.removeItem('userId');
        localStorage.removeItem('currentOrganizationId');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setUser(data.user);
    setOrganizations(data.organizations || []);
    
    if (data.organizations && data.organizations.length > 0) {
      setCurrentOrganizationState(data.organizations[0]);
      localStorage.setItem('currentOrganizationId', data.organizations[0].id.toString());
    }
    
    localStorage.setItem('userId', data.user.id.toString());
  };

  const register = async (email: string, name: string, password: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const userData = await response.json();
    
    // Auto-login after registration
    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    setOrganizations([]);
    setCurrentOrganizationState(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('currentOrganizationId');
  };

  const setCurrentOrganization = (org: Organization) => {
    setCurrentOrganizationState(org);
    localStorage.setItem('currentOrganizationId', org.id.toString());
  };

  const refreshOrganizations = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/organizations?userId=${user.id}`);
      if (response.ok) {
        const orgs = await response.json();
        setOrganizations(orgs);
        
        // Update current organization if it's still in the list
        if (currentOrganization) {
          const updatedOrg = orgs.find((org: Organization) => org.id === currentOrganization.id);
          if (updatedOrg) {
            setCurrentOrganizationState(updatedOrg);
          } else if (orgs.length > 0) {
            setCurrentOrganization(orgs[0]);
          } else {
            setCurrentOrganizationState(null);
            localStorage.removeItem('currentOrganizationId');
          }
        }
      }
    } catch (error) {
      console.error('Failed to refresh organizations:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organizations,
        currentOrganization,
        isLoading,
        login,
        register,
        logout,
        setCurrentOrganization,
        refreshOrganizations,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
