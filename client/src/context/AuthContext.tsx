import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  unreadNotificationsCount: number;
  refreshNotificationsCount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  const refreshNotificationsCount = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const data = await api.getNotifications();
      setUnreadNotificationsCount(data.unreadCount);
    } catch {
      // silent catch for unauth
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await api.getMe();
          setUser(data.user);
          await refreshNotificationsCount();
        } catch (err) {
          console.warn('Session check failed:', err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, loggedInUser: User) => {
    localStorage.setItem('token', token);
    setUser(loggedInUser);
    refreshNotificationsCount();
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // silent catch
    }
    localStorage.removeItem('token');
    setUser(null);
    setUnreadNotificationsCount(0);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, unreadNotificationsCount, refreshNotificationsCount }}>
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
