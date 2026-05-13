import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

type ModuleAccess = Record<string, boolean>;

interface RuntimeConfigValue {
  globalConfig: {
    appName: string;
    timezone: string;
    broadcastBanner: string;
  };
  masterData: Record<string, any>;
  systemSettings: Record<string, any>;
  permissions: Record<string, Record<string, boolean>>;
  moduleAccess: ModuleAccess;
  isLoading: boolean;
  refresh: () => Promise<void>;
  hasModuleAccess: (moduleName?: string) => boolean;
}

const RuntimeConfigContext = createContext<RuntimeConfigValue | undefined>(undefined);

const defaultGlobalConfig = {
  appName: 'Digital Job Card MMS',
  timezone: 'Africa/Harare',
  broadcastBanner: '',
};

export const RuntimeConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [globalConfig, setGlobalConfig] = useState(defaultGlobalConfig);
  const [masterData, setMasterData] = useState<Record<string, any>>({});
  const [systemSettings, setSystemSettings] = useState<Record<string, any>>({});
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [moduleAccess, setModuleAccess] = useState<ModuleAccess>({});
  const [isLoading, setIsLoading] = useState(false);

  const refresh = async () => {
    if (!user) {
      setGlobalConfig(defaultGlobalConfig);
      setMasterData({});
      setSystemSettings({});
      setPermissions({});
      setModuleAccess({});
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.get('/api/runtime/bootstrap');
      setGlobalConfig((prev) => ({ ...prev, ...(res.data?.global || {}) }));
      setMasterData(res.data?.masterData || {});
      setSystemSettings(res.data?.systemSettings || {});
      setPermissions(res.data?.permissions || {});
      setModuleAccess(res.data?.moduleAccess || {});
    } catch (error) {
      console.error('Failed to fetch runtime configuration', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [user?.id, user?.role]);

  const value = useMemo<RuntimeConfigValue>(() => ({
    globalConfig,
    masterData,
    systemSettings,
    permissions,
    moduleAccess,
    isLoading,
    refresh,
    hasModuleAccess: (moduleName?: string) => {
      if (!moduleName) return true;
      if (user?.role === 'Admin') return true;
      return Boolean(moduleAccess[moduleName]);
    },
  }), [globalConfig, isLoading, masterData, moduleAccess, permissions, systemSettings, user?.role]);

  return (
    <RuntimeConfigContext.Provider value={value}>
      {children}
    </RuntimeConfigContext.Provider>
  );
};

export const useRuntimeConfig = () => {
  const context = useContext(RuntimeConfigContext);
  if (!context) {
    throw new Error('useRuntimeConfig must be used within a RuntimeConfigProvider');
  }
  return context;
};
