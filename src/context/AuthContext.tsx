import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (role: User['role']) => void;
  logout: () => void;
}

const mockUsers: Record<string, User> = {
  Admin: { id: 'u1', name: 'System Admin', role: 'Admin', department: 'IT' },
  Initiator: { id: 'u2', name: 'John Doe', role: 'Initiator', department: 'Production' },
  Supervisor: { id: 'u3', name: 'Jane Smith', role: 'Supervisor', department: 'Production' },
  HOD: { id: 'u7', name: 'Dr. Robert Khumalo', role: 'HOD', department: 'Engineering' },
  EngSupervisor: { id: 'u4', name: 'Mike Ross', role: 'EngSupervisor', department: 'Engineering' },
  Artisan: { id: 'u5', name: 'Tom Builder', role: 'Artisan', department: 'Maintenance' },
  PlanningOffice: { id: 'u6', name: 'Sarah Connor', role: 'PlanningOffice', department: 'Planning' }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: User['role']) => {
    setUser(mockUsers[role]);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
