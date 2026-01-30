import api from '@/lib/api';

export interface Notification {
    id: number;
    notification_type: 'order_placed' | 'order_status' | 'shop_approved' | 'shop_rejected' | 'new_review' | 'system';
    title: string;
    message: string;
    is_read: boolean;
    related_order_id: number | null;
    related_shop_id: number | null;
    created_at: string;
}

export interface NotificationResponse {
    notifications: Notification[];
    unread_count: number;
}

const notificationService = {
    async getNotifications(): Promise<NotificationResponse> {
        const response = await api.get<NotificationResponse>('/auth/notifications/');
        return response.data;
    },

    async markAsRead(notificationId: number): Promise<void> {
        await api.post(`/auth/notifications/${notificationId}/read/`);
    },

    async markAllAsRead(): Promise<void> {
        await api.post('/auth/notifications/read-all/');
    },
};

export default notificationService;
