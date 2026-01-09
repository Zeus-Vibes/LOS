# Neighborly Hoods API Documentation

## Base URL
```
http://localhost:8000/api/
```

## Authentication
The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

## User Types
- **Admin**: Full system access
- **Customer**: Can browse, order, and review
- **Shopkeeper**: Can manage their shop and products

## API Endpoints

### Authentication (`/api/auth/`)

#### Register User (Customer/Admin)
```
POST /api/auth/register/
{
    "username": "string",
    "email": "string",
    "password": "string",
    "password_confirm": "string",
    "first_name": "string",
    "last_name": "string",
    "phone_number": "string",
    "address": "string",
    "user_type": "customer" // or "admin"
}
```

#### Register Shopkeeper
```
POST /api/auth/register/shopkeeper/
{
    "username": "string",
    "email": "string",
    "password": "string",
    "password_confirm": "string",
    "first_name": "string",
    "last_name": "string",
    "phone_number": "string",
    "address": "string",
    "business_name": "string",
    "business_license": "string",
    "business_address": "string",
    "business_phone": "string"
}
```

#### Login
```
POST /api/auth/login/
{
    "username": "string",
    "password": "string"
}
```

#### Logout
```
POST /api/auth/logout/
{
    "refresh": "refresh_token"
}
```

#### Refresh Token
```
POST /api/auth/token/refresh/
{
    "refresh": "refresh_token"
}
```

#### User Dashboard
```
GET /api/auth/dashboard/
```

### Shops (`/api/shops/`)

#### Categories
```
GET /api/shops/categories/          # List all categories
GET /api/shops/categories/{id}/     # Get category details
```

#### Shops
```
GET /api/shops/shops/               # List all shops
GET /api/shops/shops/{id}/          # Get shop details
POST /api/shops/shops/              # Create shop (shopkeeper only)
PUT /api/shops/shops/{id}/          # Update shop (owner only)
DELETE /api/shops/shops/{id}/       # Delete shop (owner only)
GET /api/shops/shops/{id}/products/ # Get shop products
```

#### Products
```
GET /api/shops/products/            # List all products
GET /api/shops/products/{id}/       # Get product details
POST /api/shops/products/           # Create product (shopkeeper only)
PUT /api/shops/products/{id}/       # Update product (owner only)
DELETE /api/shops/products/{id}/    # Delete product (owner only)

# Query parameters for filtering:
?category=1&shop=2
```

#### Search
```
GET /api/shops/search/?q=search_term
```

#### Featured Products
```
GET /api/shops/featured/
```

#### Wishlist
```
GET /api/shops/wishlist/            # Get user's wishlist
POST /api/shops/wishlist/add/       # Add to wishlist
{
    "product_id": 1
}
DELETE /api/shops/wishlist/remove/  # Remove from wishlist
{
    "product_id": 1
}
```

#### Reviews
```
GET /api/shops/reviews/             # List reviews
POST /api/shops/reviews/            # Create review
{
    "product": 1,           // optional
    "shop": 1,              // optional
    "rating": 5,
    "title": "string",
    "comment": "string"
}
```

### Orders (`/api/orders/`)

#### Cart Management
```
GET /api/orders/cart/               # Get user's cart
POST /api/orders/cart/add/          # Add item to cart
{
    "product_id": 1,
    "quantity": 2
}
PUT /api/orders/cart/update/        # Update cart item
{
    "cart_item_id": 1,
    "quantity": 3
}
DELETE /api/orders/cart/remove/     # Remove from cart
{
    "cart_item_id": 1
}
DELETE /api/orders/cart/clear/      # Clear entire cart
```

#### Checkout
```
POST /api/orders/checkout/
{
    "delivery_address": "string",
    "delivery_phone": "string",
    "delivery_instructions": "string",
    "payment_method": "cash_on_delivery", // or "online_payment", "wallet"
    "coupon_code": "string",
    "special_instructions": "string"
}
```

#### Orders
```
GET /api/orders/orders/             # List user's orders
GET /api/orders/orders/{id}/        # Get order details
POST /api/orders/orders/{id}/update_status/  # Update order status (shopkeeper/admin)
{
    "status": "confirmed",
    "message": "Order confirmed and being prepared"
}
```

#### Order Tracking
```
GET /api/orders/orders/{order_id}/track/
```

#### Coupons
```
GET /api/orders/coupons/            # List available coupons
```

## Sample Login Credentials

### Admin
- Username: `admin`
- Password: `admin123`

### Customer
- Username: `customer1`
- Password: `customer123`

### Shopkeepers
- Username: `shopkeeper1`, Password: `shopkeeper123` (Fresh Mart Grocery)
- Username: `shopkeeper2`, Password: `shopkeeper123` (Tech World Electronics)

## Order Status Flow
1. `pending` - Order placed
2. `confirmed` - Shop confirmed the order
3. `preparing` - Order is being prepared
4. `ready_for_pickup` - Ready for delivery pickup
5. `out_for_delivery` - Out for delivery
6. `delivered` - Successfully delivered
7. `cancelled` - Order cancelled
8. `refunded` - Order refunded

## Payment Methods
- `cash_on_delivery` - Cash on Delivery
- `online_payment` - Online Payment
- `wallet` - Digital Wallet

## Error Responses
All error responses follow this format:
```json
{
    "error": "Error message",
    "details": "Additional details if available"
}
```

## Admin Panel
Access the Django admin panel at: `http://localhost:8000/admin/`
- Username: `admin`
- Password: `admin123`