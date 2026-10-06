import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { authService, userService } from '../services/api';
import { disconnectSocket } from '../services/socket';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerWithPassword: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  register: (username: string, email: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => void;
  isSecureAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSecureAuth, setIsSecureAuth] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const token = authService.getToken();

    if (token) {
      const storedUser = authService.getStoredUser();
      if (storedUser) {
        setUser(storedUser);
        setIsSecureAuth(true);
      } else {
        const response = await authService.getMe();
        if (response.success && response.data) {
          setUser(response.data);
          setIsSecureAuth(true);
        } else {
          await authService.logout();
        }
      }
    } else {
      const storedUser = localStorage.getItem('utasks_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const response = await userService.getById(parsedUser.id);
          if (response.success && response.data) {
            setUser(response.data);
            setIsSecureAuth(false);
          } else {
            localStorage.removeItem('utasks_user');
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('utasks_user');
        }
      }
    }

    setIsLoading(false);
  };

  const login = (userData: User) => {
    setUser(userData);
    setIsSecureAuth(false);
    localStorage.setItem('utasks_user', JSON.stringify(userData));
  };

  const loginWithCredentials = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const response = await authService.login({ email, password });

    if (response.success && response.data) {
      setUser(response.data.user);
      setIsSecureAuth(true);
      return { success: true };
    }

    return { success: false, message: response.message || 'Login failed' };
  };

  const registerWithPassword = async (
    username: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string; user?: User }> => {
    const response = await authService.register({ username, email, password });

    if (response.success && response.data) {
      setUser(response.data.user);
      setIsSecureAuth(true);
      return { success: true, user: response.data.user };
    }

    return { success: false, message: response.message || 'Registration failed' };
  };

  const register = async (
    username: string,
    email: string
  ): Promise<{ success: boolean; message?: string; user?: User }> => {
    const response = await userService.register({ username, email });

    if (response.success && response.data) {
      const userData = {
        ...response.data,
        name: response.data.name || (response.data as any).username || username
      };
      setUser(userData);
      setIsSecureAuth(false);
      localStorage.setItem('utasks_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }

    return { success: false, message: response.message || 'Registration failed' };
  };

  const logout = async () => {
    disconnectSocket();

    if (isSecureAuth) {
      await authService.logout();
    } else {
      localStorage.removeItem('utasks_user');
    }
    setUser(null);
    setIsSecureAuth(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithCredentials,
        registerWithPassword,
        register,
        logout,
        isSecureAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
