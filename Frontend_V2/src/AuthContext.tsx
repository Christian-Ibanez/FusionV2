import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from './api';
import type { User } from './api';

export interface AppNotification {
  id: number;
  userId?: number;
  text: string;
  type: string;
  date: string;
  actionData?: any;
  read?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (correo: string, contrasena: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  notifications: AppNotification[];
  addNotification: (notif: Omit<AppNotification, 'id' | 'date'>) => void;
  removeNotification: (id: number) => void;
  updateNotification: (id: number, updates: Partial<AppNotification>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = sessionStorage.getItem('app_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('app_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('app_user');
    }
  }, [user]);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('app_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('app_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_notifications' && e.newValue) {
        try {
          setNotifications(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Error parsing notifications from storage", error);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addNotification = (notif: Omit<AppNotification, 'id' | 'date'>) => {
    const newNotif = {
      ...notif,
      userId: notif.userId || user?.id,
      id: Date.now() + Math.random(),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const updateNotification = (id: number, updates: Partial<AppNotification>) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  useEffect(() => {
    // Initial load: normally we'd check token and fetch user again.
    // For simplicity, we just stop loading if no token.
    setLoading(false);
  }, []);

  const login = async (correo: string, contrasena: string) => {
    const { user } = await authApi.login(correo, contrasena);
    setUser(user);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, login, logout, updateUser,
      notifications, addNotification, removeNotification, updateNotification 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
