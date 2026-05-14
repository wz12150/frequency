import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface UserInfo {
  username: string;
  guid?: string;
  name: string;
  email: string;
  phone: string;
  roles: string[];
  permissions: string[];
}

interface AuthContextType {
  user: UserInfo | null;
  isLoggedIn: boolean;
  login: (userInfo: UserInfo, token: string) => void;
  logout: () => void;
  hasPermission: (permissionKey: string) => boolean;
  hasRole: (roleKey: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = useCallback((userInfo: UserInfo, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userInfo));
    setUser(userInfo);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const hasPermission = useCallback((permissionKey: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permissionKey);
  }, [user]);

  const hasRole = useCallback((roleKey: string): boolean => {
    if (!user) return false;
    return user.roles.some(role => role.toUpperCase() === roleKey.toUpperCase());
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout, hasPermission, hasRole }}>
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