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

  // User CRUD
  async getUsers(type?: string): Promise<AdminUser[]> {
    const params = type ? { type } : {};
    const response = await api.get<AdminUser[]>('/auth/admin/users/', { params });
    return response.data;
  },

  async getUser(id: number): Promise<AdminUser> {
    const response = await api.get<AdminUser>(`/auth/admin/users/${id}/`);
    return response.data;
  },

  async createUser(data: Partial<AdminUser> & { password?: string }): Promise<{ message: string; id: number }> {
    const response = await api.post('/auth/admin/users/', data);
    return response.data;
  },

  async updateUser(id: number, data: Partial<AdminUser>): Promise<{ message: string }> {
    const response = await api.put(`/auth/admin/users/${id}/`, data);
    return response.data;
  },

  async deleteUser(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/auth/admin/users/${id}/`);
    return response.data;
  },

  // Shop CRUD
  async getShops(status?: string): Promise<AdminShop[]> {
    const params = status ? { status } : {};
    const response = await api.get<AdminShop[]>('/auth/admin/shops/', { params });
    return response.data;
  },

  async getShop(id: number): Promise<AdminShop> {
    const response = await api.get<AdminShop>(`/auth/admin/shops/${id}/`);
    return response.data;
  },

  async createShop(data: any): Promise<{ message: string; id: number }> {
    const response = await api.post('/auth/admin/shops/', data);
    return response.data;
  },

  async updateShop(id: number, data: Partial<AdminShop>): Promise<{ message: string }> {
    const response = await api.put(`/auth/admin/shops/${id}/`, data);
    return response.data;
  },

  async deleteShop(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/auth/admin/shops/${id}/`);
    return response.data;
  },

  // Order CRUD
  async getOrders(status?: string): Promise<AdminOrder[]> {
    const params = status ? { status } : {};
    const response = await api.get<AdminOrder[]>('/auth/admin/orders/', { params });
    return response.data;
  },

  async getOrder(id: number): Promise<AdminOrder> {
    const response = await api.get<AdminOrder>(`/auth/admin/orders/${id}/`);
    return response.data;
  },

  async updateOrder(id: number, data: { status?: string; payment_status?: string }): Promise<{ message: string }> {
    const response = await api.put(`/auth/admin/orders/${id}/`, data);
    return response.data;
  },

  async deleteOrder(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/auth/admin/orders/${id}/`);
    return response.data;
  },

  // Product CRUD
  async getProducts(params?: { status?: string; shop?: number }): Promise<any[]> {
    const response = await api.get('/auth/admin/products/', { params });
    return response.data;
  },

  async getProduct(id: number): Promise<any> {
    const response = await api.get(`/auth/admin/products/${id}/`);
    return response.data;
  },

  async createProduct(data: any): Promise<{ message: string; id: number }> {
    const response = await api.post('/auth/admin/products/', data);
    return response.data;
  },

  async updateProduct(id: number, data: any): Promise<{ message: string }> {
    const response = await api.put(`/auth/admin/products/${id}/`, data);
    return response.data;
  },

  async deleteProduct(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/auth/admin/products/${id}/`);
    return response.data;
  },

  // Category CRUD
  async getCategories(): Promise<any[]> {
    const response = await api.get('/auth/admin/categories/');
    return response.data;
  },

  async createCategory(data: { name: string; description?: string }): Promise<{ message: string; id: number }> {
    const response = await api.post('/auth/admin/categories/', data);
    return response.data;
  },

  async updateCategory(id: number, data: { name?: string; description?: string; is_active?: boolean }): Promise<{ message: string }> {
    const response = await api.put(`/auth/admin/categories/${id}/`, data);
    return response.data;
  },

  async deleteCategory(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/auth/admin/categories/${id}/`);
    return response.data;
  },

  // Reviews CRUD
  async getReviews(params?: { rating?: number; approved?: boolean }): Promise<any[]> {
    const response = await api.get('/auth/admin/reviews/', { params });
    return response.data;
  },

  async updateReview(id: number, data: { is_approved?: boolean; is_verified?: boolean }): Promise<{ message: string }> {
    const response = await api.put(`/auth/admin/reviews/${id}/`, data);
    return response.data;
  },

  async deleteReview(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/auth/admin/reviews/${id}/`);
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