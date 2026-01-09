import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import ForShopkeepers from "./pages/ForShopkeepers";
import NotFound from "./pages/NotFound";

// Auth Pages
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import ShopkeeperRegister from "./pages/auth/ShopkeeperRegister";

// Customer Pages
import BrowseShops from "./pages/customer/BrowseShops";
import ShopDetail from "./pages/customer/ShopDetail";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import OrderConfirmation from "./pages/customer/OrderConfirmation";
import OrderTracking from "./pages/customer/OrderTracking";
import CustomerDashboard from "./pages/customer/CustomerDashboard";

// Shopkeeper Pages
import ShopkeeperDashboard from "./pages/shopkeeper/ShopkeeperDashboard";

// Settings Page
import Settings from "./pages/Settings";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Index />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/for-shopkeepers" element={<ForShopkeepers />} />
            
            {/* Auth Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/register-shop" element={<ShopkeeperRegister />} />
            
            {/* Customer Pages */}
            <Route path="/browse" element={<BrowseShops />} />
            <Route path="/shop/:id" element={<ShopDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/order/:orderId" element={<OrderTracking />} />
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/orders" element={<CustomerDashboard />} />
            
            {/* Shopkeeper Pages */}
            <Route path="/shopkeeper/dashboard" element={<ShopkeeperDashboard />} />
            <Route path="/shopkeeper/orders" element={<ShopkeeperDashboard />} />
            <Route path="/shopkeeper/products" element={<ShopkeeperDashboard />} />
            <Route path="/shopkeeper/settings" element={<ShopkeeperDashboard />} />
            
            {/* Settings Page */}
            <Route path="/settings" element={<Settings />} />
            
            {/* Admin Pages */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
