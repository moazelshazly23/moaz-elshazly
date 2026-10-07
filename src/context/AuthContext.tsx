import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types/index.ts';
import { getApiUrl } from '../services/api.ts';

interface AuthContextType {
  token: string | null;
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AdminUser) => void;
  updateAdminUser: (user: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('moaz_admin_token'));
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('moaz_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(getApiUrl('/api/auth/me'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAdmin(data);
          localStorage.setItem('moaz_admin_user', JSON.stringify(data));
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Failed to verify token:', err);
      } finally {
        setIsLoading(false);
      }
    }
    verify();
  }, [token]);

  const login = (newToken: string, user: AdminUser) => {
    setToken(newToken);
    setAdmin(user);
    localStorage.setItem('moaz_admin_token', newToken);
    localStorage.setItem('moaz_admin_user', JSON.stringify(user));
  };

  const updateAdminUser = (user: AdminUser) => {
    setAdmin(user);
    localStorage.setItem('moaz_admin_user', JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('moaz_admin_token');
    localStorage.removeItem('moaz_admin_user');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        admin,
        isAuthenticated: Boolean(token && admin),
        isLoading,
        login,
        updateAdminUser,
        logout,
      }}
    >
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
