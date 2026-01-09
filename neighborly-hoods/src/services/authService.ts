import api from '@/lib/api';
import Cookies from 'js-cookie';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  user_type: 'admin' | 'customer' | 'shopkeeper';
  profile_picture: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  address?: string;
  user_type?: string;
}

export interface ShopkeeperRegisterData extends RegisterData {
  business_name: string;
  business_license?: string;
  business_address: string;
  business_phone: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
  message: string;
}

const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('=== AUTH SERVICE LOGIN ===');
    const response = await api.post<AuthResponse>('/auth/login/', credentials);
    const { access, refresh, user } = response.data;
    
    console.log('API Response received:', { user, hasAccess: !!access, hasRefresh: !!refresh });
    
    // Store tokens in cookies
    Cookies.set('access_token', access, { expires: 1, path: '/' });
    Cookies.set('refresh_token', refresh, { expires: 7, path: '/' });
    
    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    // Verify storage
    console.log('After storage:');
    console.log('- Cookie access_token:', Cookies.get('access_token') ? 'SET' : 'NOT SET');
    console.log('- Cookie refresh_token:', Cookies.get('refresh_token') ? 'SET' : 'NOT SET');
    console.log('- localStorage user:', localStorage.getItem('user') ? 'SET' : 'NOT SET');
    
    return response.data;
  },

  // Register customer
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register/', {
      ...data,
      user_type: 'customer',
    });
    const { access, refresh, user } = response.data;
    
    Cookies.set('access_token', access, { expires: 1, path: '/' });
    Cookies.set('refresh_token', refresh, { expires: 7, path: '/' });
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  // Register shopkeeper
  async registerShopkeeper(data: ShopkeeperRegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register/shopkeeper/', data);
    const { access, refresh, user } = response.data;
    
    Cookies.set('access_token', access, { expires: 1, path: '/' });
    Cookies.set('refresh_token', refresh, { expires: 7, path: '/' });
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    const refreshToken = Cookies.get('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout/', { refresh: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    Cookies.remove('access_token', { path: '/' });
    Cookies.remove('refresh_token', { path: '/' });
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = Cookies.get('access_token');
    console.log('isAuthenticated check - token exists:', !!token);
    return !!token;
  },

  // Get user profile
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile/');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<User>('/auth/profile/', data);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  // Get dashboard data
  async getDashboard(): Promise<any> {
    const response = await api.get('/auth/dashboard/');
    return response.data;
  },
};

export default authService;