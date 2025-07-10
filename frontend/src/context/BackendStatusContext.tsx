import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface BackendStatus {
  status: string;
  mongoDBConnected: boolean;
  fallbackMode: boolean;
}

interface BackendStatusContextType {
  backendStatus: BackendStatus;
  isLoading: boolean;
  checkStatus: () => Promise<void>;
}

const defaultStatus: BackendStatus = {
  status: 'unknown',
  mongoDBConnected: false,
  fallbackMode: false
};

const BackendStatusContext = createContext<BackendStatusContextType | undefined>(undefined);

export const BackendStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(defaultStatus);
  const [isLoading, setIsLoading] = useState(true);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const status = await api.checkBackendStatus();
      setBackendStatus(status);
    } catch (error) {
      console.error('Failed to check backend status:', error);
      setBackendStatus({
        status: 'error',
        mongoDBConnected: false,
        fallbackMode: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check backend status on mount
  useEffect(() => {
    checkStatus();
    
    // Set up periodic status checks (every 30 seconds)
    const intervalId = setInterval(checkStatus, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <BackendStatusContext.Provider
      value={{
        backendStatus,
        isLoading,
        checkStatus
      }}
    >
      {children}
    </BackendStatusContext.Provider>
  );
};

export const useBackendStatus = (): BackendStatusContextType => {
  const context = useContext(BackendStatusContext);
  if (context === undefined) {
    throw new Error('useBackendStatus must be used within a BackendStatusProvider');
  }
  return context;
};
