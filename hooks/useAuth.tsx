
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService';
import type { User } from '../types';
import { Role } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password_raw: string) => boolean;
  logout: () => void;
  register: (username: string, password_raw: string) => boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from session storage", error);
      sessionStorage.removeItem('user');
    }
  }, []);

  const login = useCallback((username: string, password_raw: string): boolean => {
    const foundUser = dataService.findUser(username, password_raw);
    if (foundUser) {
      setUser(foundUser);
      sessionStorage.setItem('user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('user');
  }, []);

  const register = useCallback((username: string, password_raw: string): boolean => {
    const newUser = dataService.addUser(username, password_raw);
    if (newUser) {
      // Automatically log in after registration
      setUser(newUser);
      sessionStorage.setItem('user', JSON.stringify(newUser));
      return true;
    }
    return false;
  }, []);
  
  const isAdmin = user?.role === Role.Admin;

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
