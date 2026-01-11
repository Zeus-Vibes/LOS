# Bug Fixes - Design & Planning

## Phase 1: Core Fixes (Customer Flow) - PRIORITY
Focus: Make the customer experience work end-to-end

### C3/C4/C7: Orders System Fix
**Problem**: My Orders page not working, dummy data, no real-time
**Root Cause**: Frontend not fetching from API, using mock data
**Solution**:
- Fix CustomerDashboard to fetch real orders
- Create dedicated MyOrders page
- Connect to backend orders API
- Add proper loading/error states

### C5/C6: Profile & Settings Fix
**Problem**: Can't save profile changes or notification preferences
**Solution**:
- Fix profile update API calls
- Add image upload support (base64 or file upload)
- Save notification preferences to backend

### C9/C10: Payment & Order Cancel
**Problem**: Payment not integrated, can't cancel orders
**Solution**:
- Add UPI/COD payment options
- Add cancel order API and UI button
- Update order status flow

---

## Phase 2: Admin Dashboard Fixes

### A1: Order Status Section
**Problem**: Not displaying properly
**Solution**: Fix the orders tab UI, proper status badges

### A4/A10/A12: Admin Settings & Profile
**Problem**: Settings not saving, no image upload
**Solution**:
- Create AdminSettings component
- Add profile image upload
- Add security settings (delete confirmation)
- Save notification preferences

### A6: Feedback/Reviews View
**Problem**: Admin can't see customer feedback
**Solution**: Add Reviews tab in admin dashboard

### A11: Statistical Reports
**Problem**: No report generation
**Solution**: Add reports tab with export functionality

---

## Phase 3: Shopkeeper Dashboard Fixes

### S1: Order Notifications
**Problem**: No notifications on order events
**Solution**: Add notification system (in-app + browser)

### S3/S4: Image Integration
**Problem**: Can't add images to profile/products/shop
**Solution**:
- Add image upload to product form
- Add shop logo/banner upload
- Store images (base64 in DB or file system)

### S5: Orders & Products Analytics
**Problem**: No analytics view
**Solution**: Add analytics tab with charts

---

## Phase 4: Visitor & Auth Fixes

### V1/V2: Login Page Cleanup
**Problem**: Dummy credentials shown, no back button
**Solution**: Remove credentials, add back to home button

### V3/V6: Auth Redirect
**Problem**: Visitors can try to order without login
**Solution**: Redirect to register/login when attempting purchase

### V4/V5: Real Products
**Problem**: Using dummy data
**Solution**: Ensure all products come from database

---

## Phase 5: Improvements

### I1: Notification Permission
**Solution**: Add notification permission request on first visit

### I3: Feedback System
**Solution**: Add feedback/review submission for all users

### I4: Payment Integration
**Solution**: Dummy UPI QR + COD confirmation flow

---

## Database Changes Needed
1. Add `profile_image` field to User model
2. Add `notification_preferences` JSON field
3. Add `shop_logo`, `shop_banner` to Shop model
4. Ensure Product has `image` field
5. Add Feedback/Review model if not exists
