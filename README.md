# LOS - Local Online Shop

A neighborhood marketplace platform connecting local shops with customers.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Running](#running)
8. [API Endpoints](#api-endpoints)
9. [User Credentials](#user-credentials)

---

## Overview

LOS enables local shopkeepers to list products online and customers to browse, order, and track deliveries from nearby shops. The platform provides separate dashboards for customers, shopkeepers, and administrators.

---

## Features

Customer
- Browse shops and products
- Cart and checkout
- Order tracking
- Reviews and ratings

Shopkeeper
- Shop and product management
- Order processing
- Sales analytics
- Customer feedback

Admin
- Platform statistics
- User management
- Shop approvals
- Report generation

---

## Tech Stack

Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
Backend: Django 5, Django REST Framework, Simple JWT, SQLite

---

## Project Structure

```
LOS/
|
+-- backend/
|   |
|   +-- accounts/
|   |   +-- models.py          # User, CustomerProfile, ShopkeeperProfile
|   |   +-- views.py           # Auth endpoints
|   |   +-- admin_views.py     # Admin dashboard API
|   |   +-- serializers.py
|   |   +-- urls.py
|   |
|   +-- shops/
|   |   +-- models.py          # Shop, Product, Category, Review
|   |   +-- views.py           # Shop and product endpoints
|   |   +-- serializers.py
|   |   +-- urls.py
|   |
|   +-- orders/
|   |   +-- models.py          # Order, Cart, OrderItem
|   |   +-- views.py           # Order endpoints
|   |   +-- serializers.py
|   |   +-- urls.py
|   |
|   +-- neighborly_backend/
|   |   +-- settings.py        # Django configuration
|   |   +-- urls.py            # Root URL config
|   |
|   +-- manage.py
|   +-- requirements.txt
|
+-- neighborly-hoods/
|   |
|   +-- src/
|   |   +-- components/
|   |   |   +-- ui/            # shadcn/ui components
|   |   |   +-- layout/        # Navbar, Footer
|   |   |
|   |   +-- pages/
|   |   |   +-- admin/         # AdminDashboard, AdminLogin
|   |   |   +-- auth/          # Login, SignUp, ShopkeeperRegister
|   |   |   +-- customer/      # Dashboard, Cart, Orders, Checkout
|   |   |   +-- shopkeeper/    # ShopkeeperDashboard
|   |   |
|   |   +-- services/
|   |   |   +-- authService.ts
|   |   |   +-- shopService.ts
|   |   |   +-- orderService.ts
|   |   |   +-- adminService.ts
|   |   |
|   |   +-- contexts/
|   |   |   +-- AuthContext.tsx
|   |   |
|   |   +-- lib/
|   |   |   +-- api.ts         # Axios instance
|   |   |   +-- utils.ts
|   |   |
|   |   +-- App.tsx
|   |   +-- main.tsx
|   |
|   +-- index.html
|   +-- package.json
|   +-- vite.config.ts
|   +-- tailwind.config.ts
|
+-- README.md
```

---

## Installation

Prerequisites: Node.js 18+, Python 3.10+

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
python manage.py migrate
python create_sample_data.py # Optional: seed data
```

### Frontend

```bash
cd neighborly-hoods
npm install
```

---

## Configuration

Backend (.env in backend/):
```
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:8080
```

Frontend API URL (src/lib/api.ts):
```typescript
const API_BASE_URL = 'http://localhost:8000/api';
```

---

## Running

Backend:
```bash
cd backend
python manage.py runserver
```
Runs at http://localhost:8000

Frontend:
```bash
cd neighborly-hoods
npm run dev
```
Runs at http://localhost:8080

---

## API Endpoints

### Authentication
```
POST   /api/auth/register/             Register customer
POST   /api/auth/register/shopkeeper/  Register shopkeeper
POST   /api/auth/login/                Login
POST   /api/auth/logout/               Logout
GET    /api/auth/profile/              Get profile
PATCH  /api/auth/profile/              Update profile
```

### Shops
```
GET    /api/shops/shops/               List shops
GET    /api/shops/shops/{id}/          Shop details
GET    /api/shops/products/            List products
GET    /api/shops/categories/          List categories
```

### Orders
```
GET    /api/orders/cart/               Get cart
POST   /api/orders/cart/add/           Add to cart
POST   /api/orders/checkout/           Checkout
GET    /api/orders/orders/             List orders
GET    /api/orders/orders/{id}/        Order details
```

Full API documentation: backend/API_DOCUMENTATION.md

---

## User Credentials

Admin
- Username: admin
- Password: admin123
- URL: /admin

Customer
- Username: customer1
- Password: customer123
- URL: /customer/dashboard

Shopkeeper
- Username: shopkeeper1
- Password: shopkeeper123
- URL: /shopkeeper/dashboard

---

## License

MIT
