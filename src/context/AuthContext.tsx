import React, { createContext, useContext, useState, type ReactNode } from 'react';
import axios from 'axios';
import type { RegisterUserInput, User } from '../types';
import { getErrorMessage } from '../utils/http';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterUserInput) => Promise<void>;
}

const API_BASE = '/api/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredUser = () => {
  const savedToken = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  if (!savedToken || !savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser) as User;
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const isLoading = false;

  const login = async (username: string, password: string) => {
    try {
      const res = await axios.post(`${API_BASE}/login`, { username: username.trim(), password });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Login failed'));
    }
  };

  const register = async (data: RegisterUserInput) => {
    try {
      await axios.post(`${API_BASE}/register`, data);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Registration failed'));
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
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
