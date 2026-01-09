import api from '@/lib/api';
import { Product } from './shopService';

export interface CartItem {
  id: number;
  cart: number;
  product: Product;
  quantity: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: number;
  customer: number;
  items: CartItem[];
  total_items: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order: number;
  product: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderTracking {
  id: number;
  order: number;
  status: string;
  message: string;
  created_at: string;
  created_by: number | null;
}

export interface Order {
  id: number;
  order_id: string;
  order_number: string;
  customer: number;
  customer_name: string;
  shop: number;
  shop_name: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'cash_on_delivery' | 'online_payment' | 'wallet';
  subtotal: number;
  delivery_fee: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  delivery_address: string;
  delivery_phone: string;
  delivery_instructions: string;
  estimated_delivery_time: string | null;
  actual_delivery_time: string | null;
  special_instructions: string;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  items: OrderItem[];
  tracking: OrderTracking[];
}

export interface Coupon {
  id: number;
  code: string;
  name: string;
  description: string;
  coupon_type: 'percentage' | 'fixed_amount' | 'free_delivery';
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount_amount: number | null;
  usage_limit: number | null;
  usage_limit_per_customer: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

export interface CheckoutData {
  delivery_address: string;
  delivery_phone: string;
  delivery_instructions?: string;
  payment_method: 'cash_on_delivery' | 'online_payment' | 'wallet';
  coupon_code?: string;
  special_instructions?: string;
}

const orderService = {
  // Cart
  async getCart(): Promise<Cart> {
    const response = await api.get<Cart>('/orders/cart/');
    return response.data;
  },

  async addToCart(productId: number, quantity: number = 1): Promise<{ message: string; cart_item: CartItem }> {
    const response = await api.post<{ message: string; cart_item: CartItem }>('/orders/cart/add/', {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  async updateCartItem(cartItemId: number, quantity: number): Promise<{ message: string; cart_item: CartItem }> {
    const response = await api.put<{ message: string; cart_item: CartItem }>('/orders/cart/update/', {
      cart_item_id: cartItemId,
      quantity,
    });
    return response.data;
  },

  async removeFromCart(cartItemId: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>('/orders/cart/remove/', {
      data: { cart_item_id: cartItemId },
    });
    return response.data;
  },

  async clearCart(): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>('/orders/cart/clear/');
    return response.data;
  },

  // Checkout
  async checkout(data: CheckoutData): Promise<{ message: string; orders: Order[] }> {
    const response = await api.post<{ message: string; orders: Order[] }>('/orders/checkout/', data);
    return response.data;
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const response = await api.get<Order[] | { results: Order[] }>('/orders/orders/');
    // Handle both paginated and non-paginated responses
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  async getOrder(id: number): Promise<Order> {
    const response = await api.get<Order>(`/orders/orders/${id}/`);
    return response.data;
  },

  async trackOrder(orderId: string): Promise<{ order: Order; tracking: OrderTracking[] }> {
    const response = await api.get<{ order: Order; tracking: OrderTracking[] }>(`/orders/orders/${orderId}/track/`);
    return response.data;
  },

  async updateOrderStatus(orderId: number, status: string, message?: string): Promise<{ message: string; order: Order }> {
    const response = await api.post<{ message: string; order: Order }>(`/orders/orders/${orderId}/update_status/`, {
      status,
      message,
    });
    return response.data;
  },

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    const response = await api.get<Coupon[]>('/orders/coupons/');
    return response.data;
  },
};

export default orderService;