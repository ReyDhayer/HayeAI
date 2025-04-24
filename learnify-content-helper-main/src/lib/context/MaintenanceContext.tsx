import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface MaintenanceContextType {
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
  setMaintenanceMode: (mode: boolean) => void;
  setMaintenanceMessage: (message: string) => void;
  isAuthenticated: boolean;
  userRole: string | null;
  login: (role: string) => void;
  logout: () => void;
  canViewPasswords: boolean;
  canEditPasswords: boolean;
}

const MaintenanceContext = createContext<MaintenanceContextType | null>(null);

export const useMaintenanceContext = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenanceContext must be used within a MaintenanceProvider');
  }
  return context;
};

export const MaintenanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessageState] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Recuperar estado de autenticação do localStorage
    const savedIsAuthenticated = localStorage.getItem('isAuthenticated');
    const savedUserRole = localStorage.getItem('userRole');
    if (savedIsAuthenticated === 'true') {
      setIsAuthenticated(true);
      if (savedUserRole) setUserRole(savedUserRole);
    }
  }, []);

  const setMaintenanceMode = (mode: boolean) => {
    setIsMaintenanceMode(mode);
    localStorage.setItem('maintenanceMode', JSON.stringify(mode));
  };

  const setMaintenanceMessage = (message: string) => {
    setMaintenanceMessage(message);
    localStorage.setItem('maintenanceMessage', message);
  };

  const canViewPasswords = userRole === 'admin' || userRole === 'gerente';
  const canEditPasswords = userRole === 'admin';

  const login = (role: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <MaintenanceContext.Provider
      value={{
        isMaintenanceMode,
        maintenanceMessage,
        setMaintenanceMode,
        setMaintenanceMessage,
        isAuthenticated,
        userRole,
        login,
        logout,
        canViewPasswords,
        canEditPasswords
      }}
    >
      {isMaintenanceMode && !isAuthenticated && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-center mb-4">Sistema em Manutenção</h2>
            <p className="text-center text-gray-600">
              {maintenanceMessage || 'O sistema está temporariamente indisponível para manutenção. Tente novamente mais tarde.'}
            </p>
          </div>
        </div>
      )}
      {children}
    </MaintenanceContext.Provider>
  );
};