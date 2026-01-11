import api from '@/lib/api';

export interface Category {
  id: number;
  name: string;
  description: string;
  image: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Shop {
  id: number;
  owner: number;
  owner_name: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  categories: Category[];
  opening_time: string;
  closing_time: string;
  is_open_24_7: boolean;
  latitude: number | null;
  longitude: number | null;
  logo: string | null;
  banner_image: string | null;
  status: 'active' | 'inactive' | 'suspended';
  average_rating: number;
  total_reviews: number;
  offers_delivery: boolean;
  delivery_radius: number;
  minimum_order_amount: number;
  delivery_fee: number;
  delivery_fee_per_km: number;
  free_delivery_above: number | null;
  created_at: string;
  updated_at: string;
  products?: Product[];
}

export interface Product {
  id: number;
  shop: number;
  shop_name: string;
  category: number;
  category_name: string;
  name: string;
  description: string;
  price: number;
  discount_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  sku: string;
  brand: string;
  weight: number | null;
  dimensions: string;
  image: string | null;
  status: 'available' | 'out_of_stock' | 'discontinued';
  average_rating: number;
  total_reviews: number;
  tags: string;
  is_featured: boolean;
  final_price: number;
  is_on_sale: boolean;
  is_low_stock: boolean;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
}

export interface ProductImage {
  id: number;
  product: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
  created_at: string;
}

export interface Review {
  id: number;
  product: number | null;
  product_name: string | null;
  shop: number | null;
  shop_name: string | null;
  customer: number;
  customer_name: string;
  rating: number;
  title: string;
  comment: string;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: number;
  customer: number;
  product: Product;
  created_at: string;
}

const shopService = {
  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await api.get<{ results: Category[] } | Category[]>('/shops/categories/');
    return Array.isArray(response.data) ? response.data : response.data.results;
  },

  async getCategory(id: number): Promise<Category> {
    const response = await api.get<Category>(`/shops/categories/${id}/`);
    return response.data;
  },

  // Shops
  async getShops(params?: { category?: number; search?: string; lat?: number; lng?: number; radius?: number }): Promise<Shop[]> {
    const response = await api.get<{ results: Shop[] } | Shop[]>('/shops/shops/', { params });
    return Array.isArray(response.data) ? response.data : response.data.results;
  },

  async getShop(id: number): Promise<Shop> {
    const response = await api.get<Shop>(`/shops/shops/${id}/`);
    return response.data;
  },

  async getShopProducts(shopId: number): Promise<Product[]> {
    const response = await api.get<{ results: Product[] } | Product[]>(`/shops/shops/${shopId}/products/`);
    return Array.isArray(response.data) ? response.data : response.data.results;
  },

  async getNearbyShops(lat: number, lng: number, radius: number = 10): Promise<Shop[]> {
    const response = await api.get<Shop[]>('/shops/nearby/', { params: { lat, lng, radius } });
    return response.data;
  },

  // Products
  async getProducts(params?: { category?: number; shop?: number; search?: string }): Promise<Product[]> {
    const response = await api.get<{ results: Product[] } | Product[]>('/shops/products/', { params });
    return Array.isArray(response.data) ? response.data : response.data.results;
  },

  async getProduct(id: number): Promise<Product> {
    const response = await api.get<Product>(`/shops/products/${id}/`);
    return response.data;
  },

  async searchProducts(query: string): Promise<{ results: Product[] }> {
    const response = await api.get<{ results: Product[] }>('/shops/search/', { params: { q: query } });
    return response.data;
  },

  async getFeaturedProducts(): Promise<{ results: Product[] }> {
    const response = await api.get<{ results: Product[] }>('/shops/featured/');
    return response.data;
  },

  // Shopkeeper endpoints
  async getMyShop(): Promise<Shop> {
    const response = await api.get<Shop>('/shops/my-shop/');
    return response.data;
  },

  async createShop(data: Partial<Shop>): Promise<Shop> {
    const response = await api.post<Shop>('/shops/my-shop/create/', data);
    return response.data;
  },

  async updateMyShop(data: Partial<Shop>): Promise<Shop> {
    const response = await api.patch<Shop>('/shops/my-shop/update/', data);
    return response.data;
  },

  async getMyProducts(): Promise<Product[]> {
    const response = await api.get<Product[]>('/shops/my-products/');
    return response.data;
  },

  async addProduct(data: Partial<Product>): Promise<Product> {
    const response = await api.post<Product>('/shops/my-products/add/', data);
    return response.data;
  },

  async updateProduct(productId: number, data: Partial<Product>): Promise<Product> {
    const response = await api.patch<Product>(`/shops/my-products/${productId}/update/`, data);
    return response.data;
  },

  async deleteProduct(productId: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/shops/my-products/${productId}/delete/`);
    return response.data;
  },

  async getMyOrders(): Promise<any[]> {
    const response = await api.get<any[]>('/shops/my-orders/');
    return response.data;
  },

  async getMyStats(): Promise<{
    total_orders: number;
    pending_orders: number;
    total_revenue: number;
    total_products: number;
    average_rating: number;
    total_reviews: number;
  }> {
    const response = await api.get('/shops/my-stats/');
    return response.data;
  },

  // Reviews
  async getReviews(params?: { product?: number; shop?: number }): Promise<Review[]> {
    const response = await api.get<Review[]>('/shops/reviews/', { params });
    return response.data;
  },

  async getShopReviews(shopId: number): Promise<Review[]> {
    const response = await api.get<Review[]>('/shops/reviews/', { params: { shop: shopId } });
    return response.data;
  },

  async createReview(data: { product?: number; shop?: number; rating: number; title?: string; comment: string }): Promise<Review> {
    const response = await api.post<Review>('/shops/reviews/', data);
    return response.data;
  },

  // Wishlist
  async getWishlist(): Promise<WishlistItem[]> {
    const response = await api.get<WishlistItem[]>('/shops/wishlist/');
    return response.data;
  },

  async addToWishlist(productId: number): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/shops/wishlist/add/', { product_id: productId });
    return response.data;
  },

  async removeFromWishlist(productId: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>('/shops/wishlist/remove/', { data: { product_id: productId } });
    return response.data;
  },

  // Shopkeeper reviews
  async getMyReviews(): Promise<Review[]> {
    const response = await api.get<Review[]>('/shops/my-reviews/');
    return response.data;
  },

  // Shopkeeper analytics
  async getMyAnalytics(): Promise<{
    daily_revenue: { date: string; revenue: number; count: number }[];
    orders_by_status: { status: string; count: number }[];
    top_products: { product__name: string; total_sold: number; revenue: number }[];
    monthly_revenue: { month: string; revenue: number; count: number }[];
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
  }> {
    const response = await api.get('/shops/my-analytics/');
    return response.data;
  },
};

export default shopService;