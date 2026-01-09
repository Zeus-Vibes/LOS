import api from '@/lib/api';

export interface DashboardStats {
  users: {
    total: number;
    customers: number;
    shopkeepers: number;
  };
  shops: {
    total: number;
    active: number;
    pending_verification: number;
  };
  products: {
    total: number;
    available: number;
    out_of_stock: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    today: number;
    monthly: number;
  };
  categories: number;
  reviews: {
    total: number;
    average_rating: number;
  };
  monthly_orders: number;
}

export interface RecentOrder {
  id: number;
  order_number: string;
  customer: string;
  customer_name: string;
  shop: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export interface RecentUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  user_type: string;
  is_verified: boolean;
  created_at: string;
}

export interface PendingShopkeeper {
  id: number;
  user_id: number;
  username: string;
  email: string;
  business_name: string;
  business_phone: string;
  business_address: string;
  business_license: string;
  created_at: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopShop {
  id: number;
  name: string;
  owner: string;
  total_orders: number;
  total_revenue: number;
  average_rating: number;
  status: string;
}

export interface TopProduct {
  id: number;
  name: string;
  shop: string;
  price: number;
  total_sold: number;
  total_revenue: number;
  stock: number;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  user_type: string;
  phone_number: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface AdminShop {
  id: number;
  name: string;
  owner: string;
  owner_email: string;
  phone: string;
  address: string;
  status: string;
  average_rating: number;
  total_reviews: number;
  offers_delivery: boolean;
  created_at: string;
}

export interface AdminOrder {
  id: number;
  order_number: string;
  customer: string;
  customer_email: string;
  shop: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  delivery_address: string;
  created_at: string;
}

const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/auth/admin/stats/');
    return response.data;
  },

  async getRecentOrders(): Promise<RecentOrder[]> {
    const response = await api.get<RecentOrder[]>('/auth/admin/recent-orders/');
    return response.data;
  },

  async getRecentUsers(): Promise<RecentUser[]> {
    const response = await api.get<RecentUser[]>('/auth/admin/recent-users/');
    return response.data;
  },

  async getPendingShopkeepers(): Promise<PendingShopkeeper[]> {
    const response = await api.get<PendingShopkeeper[]>('/auth/admin/pending-shopkeepers/');
    return response.data;
  },

  async getRevenueChart(): Promise<RevenueData[]> {
    const response = await api.get<RevenueData[]>('/auth/admin/revenue-chart/');
    return response.data;
  },

  async getTopShops(): Promise<TopShop[]> {
    const response = await api.get<TopShop[]>('/auth/admin/top-shops/');
    return response.data;
  },

  async getTopProducts(): Promise<TopProduct[]> {
    const response = await api.get<TopProduct[]>('/auth/admin/top-products/');
    return response.data;
  },

  async getAllUsers(type?: string): Promise<AdminUser[]> {
    const params = type ? { type } : {};
    const response = await api.get<AdminUser[]>('/auth/admin/users/', { params });
    return response.data;
  },

  async getAllShops(status?: string): Promise<AdminShop[]> {
    const params = status ? { status } : {};
    const response = await api.get<AdminShop[]>('/auth/admin/shops/', { params });
    return response.data;
  },

  async getAllOrders(status?: string): Promise<AdminOrder[]> {
    const params = status ? { status } : {};
    const response = await api.get<AdminOrder[]>('/auth/admin/orders/', { params });
    return response.data;
  },

  async approveShopkeeper(shopkeeperId: number): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/auth/shopkeepers/${shopkeeperId}/approve/`);
    return response.data;
  },

  async rejectShopkeeper(shopkeeperId: number): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/auth/shopkeepers/${shopkeeperId}/reject/`);
    return response.data;
  },
};

export default adminService;