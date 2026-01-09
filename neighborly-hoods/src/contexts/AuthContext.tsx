import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import authService, { User, LoginCredentials, RegisterData, ShopkeeperRegisterData } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  registerShopkeeper: (data: ShopkeeperRegisterData) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = () => {
    console.log('=== AUTH INIT ===');
    const token = Cookies.get('access_token');
    const userStr = localStorage.getItem('user');
    
    console.log('Token exists:', !!token);
    console.log('User string exists:', !!userStr);
    
    if (token && userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        console.log('Parsed user:', parsedUser);
        console.log('User type:', parsedUser.user_type);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse user:', e);
        clearAuth();
      }
    } else {
      console.log('No auth data found');
    }
    setIsLoading(false);
  };

  const clearAuth = () => {
    localStorage.removeItem('user');
    Cookies.remove('access_token', { path: '/' });
    Cookies.remove('refresh_token', { path: '/' });
    setUser(null);
  };

  const login = async (credentials: LoginCredentials): Promise<User> => {
    console.log('=== CONTEXT LOGIN ===');
    const response = await authService.login(credentials);
    console.log('Login response in context:', response);
    console.log('User from response:', response.user);
    console.log('User type:', response.user.user_type);
    setUser(response.user);
    return response.user;
  };

  const register = async (data: RegisterData): Promise<User> => {
    const response = await authService.register(data);
    setUser(response.user);
    return response.user;
  };

  const registerShopkeeper = async (data: ShopkeeperRegisterData): Promise<User> => {
    const response = await authService.registerShopkeeper(data);
    setUser(response.user);
    return response.user;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const updatedUser = await authService.getProfile();
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      clearAuth();
    }
  };

  const isAuthenticated = !!user && !!Cookies.get('access_token');

  console.log('Auth state - User:', user?.username, 'Type:', user?.user_type, 'isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        registerShopkeeper,
        logout,
        refreshUser,
      }}
    >
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