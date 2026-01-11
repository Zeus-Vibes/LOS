import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Users, Store, Package, ShoppingCart, DollarSign, TrendingUp,
  RefreshCw, LogOut, Plus, Edit, Trash2, Loader2, CheckCircle, XCircle, Settings, Home, AlertTriangle, Star, Download, FileText, BarChart3, Bell
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import adminService, { DashboardStats, RecentOrder, RecentUser, PendingShopkeeper, TopShop, RevenueData } from "@/services/adminService";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const AdminDashboard = () => {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [pendingShopkeepers, setPendingShopkeepers] = useState<PendingShopkeeper[]>([]);
  const [topShops, setTopShops] = useState<TopShop[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  
  // CRUD state
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allShops, setAllShops] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  
  // Dialog state
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showShopDialog, setShowShopDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [userForm, setUserForm] = useState({ username: '', email: '', first_name: '', last_name: '', user_type: 'customer', phone_number: '', is_active: true });
  const [shopForm, setShopForm] = useState({ name: '', description: '', phone: '', email: '', address: '', status: 'active' });
  const [orderForm, setOrderForm] = useState({ status: '', payment_status: '' });
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock_quantity: '', status: 'available', shop_id: '', category_id: '' });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate('/login', { replace: true }); return; }
    if (user?.user_type !== 'admin') { toast({ title: "Access Denied", description: "Admin privileges required", variant: "destructive" }); navigate('/browse', { replace: true }); return; }
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      const [statsData, ordersData, usersData, pendingData, shopsData, chartData] = await Promise.all([
        adminService.getDashboardStats(), adminService.getRecentOrders(), adminService.getRecentUsers(),
        adminService.getPendingShopkeepers(), adminService.getTopShops(), adminService.getRevenueChart()
      ]);
      console.log('Stats data received:', statsData);
      setStats(statsData); setRecentOrders(ordersData); setRecentUsers(usersData);
      setPendingShopkeepers(pendingData); setTopShops(shopsData); setRevenueData(chartData);
    } catch (error) { 
      console.error('Failed to fetch dashboard data:', error);
      toast({ title: "Error", description: "Failed to load dashboard data", variant: "destructive" });
    }
    finally { setIsLoading(false); setIsRefreshing(false); }
  };

  const fetchAllData = async (tab: string) => {
    try {
      if (tab === 'users') { const data = await adminService.getUsers(); setAllUsers(data); }
      if (tab === 'shops') { const data = await adminService.getShops(); setAllShops(data); }
      if (tab === 'orders') { const data = await adminService.getOrders(); setAllOrders(data); }
      if (tab === 'products') { 
        const [prods, cats] = await Promise.all([adminService.getProducts(), adminService.getCategories()]);
        setAllProducts(prods); setCategories(cats);
      }
      if (tab === 'reviews') { const data = await adminService.getReviews(); setAllReviews(data); }
    } catch (error) { console.error('Failed to fetch data:', error); }
  };

  useEffect(() => { if (['users', 'shops', 'orders', 'products', 'reviews'].includes(activeTab)) fetchAllData(activeTab); }, [activeTab]);

  const handleRefresh = () => { setIsRefreshing(true); fetchDashboardData(); fetchAllData(activeTab); toast({ title: "Dashboard refreshed" }); };
  const handleLogout = async () => { await logout(); navigate('/login'); };
  const confirmLogout = () => { setShowLogoutDialog(true); };
  const handleApproveShopkeeper = async (id: number) => { try { await adminService.approveShopkeeper(id); toast({ title: "Shopkeeper approved" }); fetchDashboardData(); } catch { toast({ title: "Error", variant: "destructive" }); } };
  const handleRejectShopkeeper = async (id: number) => { try { await adminService.rejectShopkeeper(id); toast({ title: "Shopkeeper rejected" }); fetchDashboardData(); } catch { toast({ title: "Error", variant: "destructive" }); } };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { 
      pending: 'bg-yellow-100 text-yellow-800', 
      confirmed: 'bg-blue-100 text-blue-800', 
      preparing: 'bg-purple-100 text-purple-800', 
      ready_for_pickup: 'bg-indigo-100 text-indigo-800',
      ready: 'bg-indigo-100 text-indigo-800',
      out_for_delivery: 'bg-cyan-100 text-cyan-800',
      delivered: 'bg-green-100 text-green-800', 
      cancelled: 'bg-red-100 text-red-800', 
      refunded: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800', 
      failed: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800', 
      inactive: 'bg-gray-100 text-gray-800',
      available: 'bg-green-100 text-green-800',
      out_of_stock: 'bg-red-100 text-red-800',
      discontinued: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  // CRUD Handlers - Users
  const openEditUser = (user: any) => { setEditingItem(user); setUserForm({ username: user.username, email: user.email, first_name: user.first_name || '', last_name: user.last_name || '', user_type: user.user_type, phone_number: user.phone_number || '', is_active: user.is_active }); setShowUserDialog(true); };
  const openAddUser = () => { setEditingItem(null); setUserForm({ username: '', email: '', first_name: '', last_name: '', user_type: 'customer', phone_number: '', is_active: true }); setShowUserDialog(true); };
  const handleSaveUser = async () => {
    setIsSaving(true);
    try {
      if (editingItem) { await adminService.updateUser(editingItem.id, userForm); toast({ title: "User updated" }); }
      else { await adminService.createUser({ ...userForm, password: 'defaultpass123' }); toast({ title: "User created" }); }
      setShowUserDialog(false); fetchAllData('users');
    } catch (e: any) { toast({ title: "Error", description: e.response?.data?.error || "Failed", variant: "destructive" }); }
    finally { setIsSaving(false); }
  };
  const handleDeleteUser = async (id: number) => { if (!confirm('Delete this user?')) return; try { await adminService.deleteUser(id); toast({ title: "User deleted" }); fetchAllData('users'); } catch { toast({ title: "Error", variant: "destructive" }); } };

  // CRUD Handlers - Shops
  const openEditShop = (shop: any) => { setEditingItem(shop); setShopForm({ name: shop.name, description: shop.description || '', phone: shop.phone || '', email: shop.email || '', address: shop.address || '', status: shop.status }); setShowShopDialog(true); };
  const handleSaveShop = async () => {
    setIsSaving(true);
    try { await adminService.updateShop(editingItem.id, shopForm); toast({ title: "Shop updated" }); setShowShopDialog(false); fetchAllData('shops'); }
    catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setIsSaving(false); }
  };
  const handleDeleteShop = async (id: number) => { if (!confirm('Delete this shop?')) return; try { await adminService.deleteShop(id); toast({ title: "Shop deleted" }); fetchAllData('shops'); } catch { toast({ title: "Error", variant: "destructive" }); } };

  // CRUD Handlers - Orders
  const openEditOrder = (order: any) => { setEditingItem(order); setOrderForm({ status: order.status, payment_status: order.payment_status }); setShowOrderDialog(true); };
  const handleSaveOrder = async () => {
    setIsSaving(true);
    try { await adminService.updateOrder(editingItem.id, orderForm); toast({ title: "Order updated" }); setShowOrderDialog(false); fetchAllData('orders'); }
    catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setIsSaving(false); }
  };
  const handleDeleteOrder = async (id: number) => { if (!confirm('Delete this order?')) return; try { await adminService.deleteOrder(id); toast({ title: "Order deleted" }); fetchAllData('orders'); } catch { toast({ title: "Error", variant: "destructive" }); } };

  // CRUD Handlers - Products
  const openEditProduct = (product: any) => { setEditingItem(product); setProductForm({ name: product.name, description: product.description || '', price: String(product.price), stock_quantity: String(product.stock_quantity), status: product.status, shop_id: String(product.shop_id), category_id: product.category_id ? String(product.category_id) : '' }); setShowProductDialog(true); };
  const handleSaveProduct = async () => {
    setIsSaving(true);
    try {
      const data = { name: productForm.name, description: productForm.description, price: parseFloat(productForm.price), stock_quantity: parseInt(productForm.stock_quantity), status: productForm.status, category_id: productForm.category_id ? parseInt(productForm.category_id) : null };
      await adminService.updateProduct(editingItem.id, data); toast({ title: "Product updated" }); setShowProductDialog(false); fetchAllData('products');
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setIsSaving(false); }
  };
  const handleDeleteProduct = async (id: number) => { if (!confirm('Delete this product?')) return; try { await adminService.deleteProduct(id); toast({ title: "Product deleted" }); fetchAllData('products'); } catch { toast({ title: "Error", variant: "destructive" }); } };

  // CRUD Handlers - Reviews
  const handleApproveReview = async (id: number, approved: boolean) => {
    try {
      await adminService.updateReview(id, { is_approved: approved });
      toast({ title: approved ? "Review approved" : "Review hidden" });
      fetchAllData('reviews');
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };
  const handleDeleteReview = async (id: number) => { if (!confirm('Delete this review?')) return; try { await adminService.deleteReview(id); toast({ title: "Review deleted" }); fetchAllData('reviews'); } catch { toast({ title: "Error", variant: "destructive" }); } };

  if (authLoading || isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!isAuthenticated || user?.user_type !== 'admin') return null;

  const orderStatusData = stats ? [
    { name: 'Pending', value: stats.orders.pending, color: '#eab308' }, 
    { name: 'Delivered', value: stats.orders.completed, color: '#22c55e' }, 
    { name: 'Cancelled', value: stats.orders.cancelled, color: '#ef4444' },
    { name: 'In Progress', value: Math.max(0, stats.orders.total - stats.orders.pending - stats.orders.completed - stats.orders.cancelled), color: '#8b5cf6' }
  ].filter(item => item.value > 0) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white hover:opacity-90 transition-opacity" title="Go to Store">
              <Home className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.first_name || user?.username}</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {/* Notification Bell */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  {(pendingShopkeepers.length > 0 || (stats?.orders.pending || 0) > 0) && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {pendingShopkeepers.length + (stats?.orders.pending || 0) > 9 ? '9+' : pendingShopkeepers.length + (stats?.orders.pending || 0)}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {pendingShopkeepers.length > 0 && (
                      <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">{pendingShopkeepers.length} pending shopkeeper approval{pendingShopkeepers.length > 1 ? 's' : ''}</span>
                        </div>
                        <Button size="sm" variant="link" className="p-0 h-auto text-yellow-700" onClick={() => setActiveTab('approvals')}>View approvals →</Button>
                      </div>
                    )}
                    {(stats?.orders.pending || 0) > 0 && (
                      <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">{stats?.orders.pending} pending order{(stats?.orders.pending || 0) > 1 ? 's' : ''}</span>
                        </div>
                        <Button size="sm" variant="link" className="p-0 h-auto text-blue-700" onClick={() => setActiveTab('orders')}>View orders →</Button>
                      </div>
                    )}
                    {recentOrders.slice(0, 3).map(order => (
                      <div key={order.id} className="p-2 bg-gray-50 rounded-lg text-sm">
                        <p className="font-medium">New order #{order.order_number}</p>
                        <p className="text-gray-500 text-xs">{order.customer_name} • {formatCurrency(order.total_amount)}</p>
                      </div>
                    ))}
                    {pendingShopkeepers.length === 0 && (stats?.orders.pending || 0) === 0 && recentOrders.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No new notifications</p>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Link to="/settings">
              <Button variant="outline" size="sm"><Settings className="w-4 h-4 mr-2" /> Settings</Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={confirmLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="shops">Shops</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="approvals">Approvals ({pendingShopkeepers.length})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.users.total || 0}</div><p className="text-xs text-muted-foreground">{stats?.users.customers} customers, {stats?.users.shopkeepers} shopkeepers</p></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Shops</CardTitle><Store className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.shops.total || 0}</div><p className="text-xs text-muted-foreground">{stats?.shops.active} active, {stats?.shops.pending_verification} pending</p></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Orders</CardTitle><ShoppingCart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.orders.total || 0}</div><p className="text-xs text-muted-foreground">{stats?.orders.pending} pending</p></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Revenue</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(stats?.revenue.total || 0)}</div><p className="text-xs text-muted-foreground">Today: {formatCurrency(stats?.revenue.today || 0)}</p></CardContent></Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Revenue Trend (30 Days)</CardTitle></CardHeader><CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} /><YAxis /><Tooltip formatter={(v: number) => formatCurrency(v)} /><Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} /></LineChart>
                </ResponsiveContainer>
              </CardContent></Card>
              <Card><CardHeader><CardTitle>Order Status Distribution</CardTitle></CardHeader><CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>{orderStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
              </CardContent></Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card><CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader><CardContent>
                <div className="space-y-3">{recentOrders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div><p className="font-medium">{order.order_number}</p><p className="text-sm text-gray-500">{order.customer_name} • {order.shop}</p></div>
                    <div className="text-right"><p className="font-medium">{formatCurrency(order.total_amount)}</p><Badge className={getStatusColor(order.status)}>{order.status}</Badge></div>
                  </div>
                ))}</div>
              </CardContent></Card>
              <Card><CardHeader><CardTitle>Top Shops</CardTitle></CardHeader><CardContent>
                <div className="space-y-3">{topShops.slice(0, 5).map(shop => (
                  <div key={shop.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div><p className="font-medium">{shop.name}</p><p className="text-sm text-gray-500">{shop.owner} • {shop.total_orders} orders</p></div>
                    <div className="text-right"><p className="font-medium">{formatCurrency(shop.total_revenue)}</p><Badge className={getStatusColor(shop.status)}>{shop.status}</Badge></div>
                  </div>
                ))}</div>
              </CardContent></Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            {/* Order Status Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{allOrders.filter(o => o.status === 'pending').length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Confirmed</p>
                      <p className="text-2xl font-bold text-blue-600">{allOrders.filter(o => o.status === 'confirmed').length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Preparing</p>
                      <p className="text-2xl font-bold text-purple-600">{allOrders.filter(o => o.status === 'preparing').length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-indigo-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Ready</p>
                      <p className="text-2xl font-bold text-indigo-600">{allOrders.filter(o => o.status === 'ready_for_pickup' || o.status === 'ready').length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-cyan-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Out for Delivery</p>
                      <p className="text-2xl font-bold text-cyan-600">{allOrders.filter(o => o.status === 'out_for_delivery').length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-cyan-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Delivered</p>
                      <p className="text-2xl font-bold text-green-600">{allOrders.filter(o => o.status === 'delivered').length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Cancelled</p>
                      <p className="text-2xl font-bold text-red-600">{allOrders.filter(o => o.status === 'cancelled').length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card><CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Orders</CardTitle>
              <div className="flex gap-2">
                <Select defaultValue="all" onValueChange={(value) => {
                  if (value === 'all') {
                    fetchAllData('orders');
                  } else {
                    adminService.getOrders(value).then(setAllOrders);
                  }
                }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader><CardContent>
              {allOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No orders found</p>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-gray-50"><th className="text-left p-3 font-semibold">Order #</th><th className="text-left p-3 font-semibold">Customer</th><th className="text-left p-3 font-semibold">Shop</th><th className="text-left p-3 font-semibold">Amount</th><th className="text-left p-3 font-semibold">Status</th><th className="text-left p-3 font-semibold">Payment</th><th className="text-left p-3 font-semibold">Date</th><th className="text-left p-3 font-semibold">Actions</th></tr></thead>
                  <tbody>{allOrders.map(order => (
                    <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-medium text-primary">{order.order_number}</td>
                      <td className="p-3">{order.customer}</td>
                      <td className="p-3">{order.shop}</td>
                      <td className="p-3 font-medium">{formatCurrency(order.total_amount)}</td>
                      <td className="p-3"><Badge className={`${getStatusColor(order.status)} capitalize`}>{order.status.replace(/_/g, ' ')}</Badge></td>
                      <td className="p-3"><Badge className={`${getStatusColor(order.payment_status)} capitalize`}>{order.payment_status}</Badge></td>
                      <td className="p-3 text-gray-500">{formatDate(order.created_at)}</td>
                      <td className="p-3"><div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => openEditOrder(order)}><Edit className="w-3 h-3" /></Button><Button size="sm" variant="destructive" onClick={() => handleDeleteOrder(order.id)}><Trash2 className="w-3 h-3" /></Button></div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              )}
            </CardContent></Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>All Users</CardTitle><Button onClick={openAddUser}><Plus className="w-4 h-4 mr-2" /> Add User</Button></CardHeader><CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left p-3">Username</th><th className="text-left p-3">Email</th><th className="text-left p-3">Name</th><th className="text-left p-3">Type</th><th className="text-left p-3">Status</th><th className="text-left p-3">Joined</th><th className="text-left p-3">Actions</th></tr></thead>
                  <tbody>{allUsers.map(u => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{u.username}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{u.full_name}</td>
                      <td className="p-3"><Badge variant="outline">{u.user_type}</Badge></td>
                      <td className="p-3"><Badge className={u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{u.is_active ? 'Active' : 'Inactive'}</Badge></td>
                      <td className="p-3">{formatDate(u.created_at)}</td>
                      <td className="p-3"><div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => openEditUser(u)}><Edit className="w-3 h-3" /></Button>{u.user_type !== 'admin' && <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(u.id)}><Trash2 className="w-3 h-3" /></Button>}</div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </CardContent></Card>
          </TabsContent>

          {/* Shops Tab */}
          <TabsContent value="shops">
            <Card><CardHeader><CardTitle>All Shops</CardTitle></CardHeader><CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left p-3">Name</th><th className="text-left p-3">Owner</th><th className="text-left p-3">Phone</th><th className="text-left p-3">Address</th><th className="text-left p-3">Rating</th><th className="text-left p-3">Status</th><th className="text-left p-3">Actions</th></tr></thead>
                  <tbody>{allShops.map(shop => (
                    <tr key={shop.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{shop.name}</td>
                      <td className="p-3">{shop.owner}</td>
                      <td className="p-3">{shop.phone}</td>
                      <td className="p-3 max-w-[200px] truncate">{shop.address}</td>
                      <td className="p-3">⭐ {shop.average_rating.toFixed(1)}</td>
                      <td className="p-3"><Badge className={getStatusColor(shop.status)}>{shop.status}</Badge></td>
                      <td className="p-3"><div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => openEditShop(shop)}><Edit className="w-3 h-3" /></Button><Button size="sm" variant="destructive" onClick={() => handleDeleteShop(shop.id)}><Trash2 className="w-3 h-3" /></Button></div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </CardContent></Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card><CardHeader><CardTitle>All Products</CardTitle></CardHeader><CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left p-3">Name</th><th className="text-left p-3">Shop</th><th className="text-left p-3">Category</th><th className="text-left p-3">Price</th><th className="text-left p-3">Stock</th><th className="text-left p-3">Status</th><th className="text-left p-3">Actions</th></tr></thead>
                  <tbody>{allProducts.map(product => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="p-3">{product.shop}</td>
                      <td className="p-3">{product.category || '-'}</td>
                      <td className="p-3">{formatCurrency(product.price)}</td>
                      <td className="p-3">{product.stock_quantity}</td>
                      <td className="p-3"><Badge className={getStatusColor(product.status)}>{product.status}</Badge></td>
                      <td className="p-3"><div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => openEditProduct(product)}><Edit className="w-3 h-3" /></Button><Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="w-3 h-3" /></Button></div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </CardContent></Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card><CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Customer Reviews & Feedback</CardTitle>
              <div className="flex gap-2">
                <Select defaultValue="all" onValueChange={(value) => {
                  if (value === 'all') {
                    fetchAllData('reviews');
                  } else {
                    adminService.getReviews({ rating: parseInt(value) }).then(setAllReviews);
                  }
                }}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader><CardContent>
              {allReviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No reviews found</p>
                </div>
              ) : (
              <div className="space-y-4">
                {allReviews.map(review => (
                  <div key={review.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{review.customer_name}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          {!review.is_approved && <Badge variant="outline" className="text-red-600">Hidden</Badge>}
                          {review.is_verified && <Badge className="bg-green-100 text-green-800">Verified</Badge>}
                        </div>
                        {review.title && <p className="font-medium text-sm mb-1">{review.title}</p>}
                        <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {review.product && <span>Product: {review.product}</span>}
                          {review.shop && <span>Shop: {review.shop}</span>}
                          <span>{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4">
                        {review.is_approved ? (
                          <Button size="sm" variant="outline" onClick={() => handleApproveReview(review.id, false)} title="Hide review">
                            <XCircle className="w-3 h-3" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleApproveReview(review.id, true)} title="Approve review">
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteReview(review.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </CardContent></Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="space-y-6">
              {/* Report Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Total Revenue</p>
                        <p className="text-3xl font-bold">{formatCurrency(stats?.revenue.total || 0)}</p>
                        <p className="text-blue-100 text-xs mt-1">All time</p>
                      </div>
                      <DollarSign className="w-12 h-12 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Monthly Revenue</p>
                        <p className="text-3xl font-bold">{formatCurrency(stats?.revenue.monthly || 0)}</p>
                        <p className="text-green-100 text-xs mt-1">This month</p>
                      </div>
                      <TrendingUp className="w-12 h-12 text-green-200" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Monthly Orders</p>
                        <p className="text-3xl font-bold">{stats?.monthly_orders || 0}</p>
                        <p className="text-purple-100 text-xs mt-1">This month</p>
                      </div>
                      <ShoppingCart className="w-12 h-12 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Report Generation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Generate Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => {
                      const csvContent = "Order Number,Customer,Shop,Amount,Status,Date\n" + 
                        allOrders.map(o => `${o.order_number},${o.customer},${o.shop},${o.total_amount},${o.status},${o.created_at}`).join("\n");
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `orders_report_${new Date().toISOString().split('T')[0]}.csv`;
                      a.click();
                      toast({ title: "Report Downloaded", description: "Orders report has been downloaded" });
                    }}>
                      <Download className="w-6 h-6" />
                      <span className="font-medium">Orders Report</span>
                      <span className="text-xs text-muted-foreground">Export all orders</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => {
                      const csvContent = "Username,Email,Name,Type,Status,Joined\n" + 
                        allUsers.map(u => `${u.username},${u.email},${u.full_name},${u.user_type},${u.is_active ? 'Active' : 'Inactive'},${u.created_at}`).join("\n");
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `users_report_${new Date().toISOString().split('T')[0]}.csv`;
                      a.click();
                      toast({ title: "Report Downloaded", description: "Users report has been downloaded" });
                    }}>
                      <Download className="w-6 h-6" />
                      <span className="font-medium">Users Report</span>
                      <span className="text-xs text-muted-foreground">Export all users</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => {
                      const csvContent = "Name,Owner,Phone,Address,Rating,Status\n" + 
                        allShops.map(s => `${s.name},${s.owner},${s.phone},"${s.address}",${s.average_rating},${s.status}`).join("\n");
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `shops_report_${new Date().toISOString().split('T')[0]}.csv`;
                      a.click();
                      toast({ title: "Report Downloaded", description: "Shops report has been downloaded" });
                    }}>
                      <Download className="w-6 h-6" />
                      <span className="font-medium">Shops Report</span>
                      <span className="text-xs text-muted-foreground">Export all shops</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => {
                      const csvContent = "Name,Shop,Category,Price,Stock,Status\n" + 
                        allProducts.map(p => `${p.name},${p.shop},${p.category || '-'},${p.price},${p.stock_quantity},${p.status}`).join("\n");
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `products_report_${new Date().toISOString().split('T')[0]}.csv`;
                      a.click();
                      toast({ title: "Report Downloaded", description: "Products report has been downloaded" });
                    }}>
                      <Download className="w-6 h-6" />
                      <span className="font-medium">Products Report</span>
                      <span className="text-xs text-muted-foreground">Export all products</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics Overview */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Platform Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Total Users</span>
                        <span className="font-bold text-lg">{stats?.users.total || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Active Shops</span>
                        <span className="font-bold text-lg">{stats?.shops.active || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Total Products</span>
                        <span className="font-bold text-lg">{stats?.products.total || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Total Orders</span>
                        <span className="font-bold text-lg">{stats?.orders.total || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Completed Orders</span>
                        <span className="font-bold text-lg text-green-600">{stats?.orders.completed || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Average Rating</span>
                        <span className="font-bold text-lg flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          {stats?.reviews.average_rating || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} />
                        <YAxis />
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} name="Revenue" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals">
            <Card><CardHeader><CardTitle>Pending Shopkeeper Approvals</CardTitle></CardHeader><CardContent>
              {pendingShopkeepers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No pending approvals</p>
              ) : (
                <div className="space-y-4">{pendingShopkeepers.map(shopkeeper => (
                  <div key={shopkeeper.id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{shopkeeper.business_name}</h3>
                        <p className="text-sm text-gray-600">Owner: {shopkeeper.username} ({shopkeeper.email})</p>
                        <p className="text-sm text-gray-600">Phone: {shopkeeper.business_phone}</p>
                        <p className="text-sm text-gray-600">Address: {shopkeeper.business_address}</p>
                        <p className="text-sm text-gray-600">License: {shopkeeper.business_license}</p>
                        <p className="text-xs text-gray-400 mt-1">Applied: {formatDate(shopkeeper.created_at)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveShopkeeper(shopkeeper.user_id)}><CheckCircle className="w-4 h-4 mr-1" /> Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRejectShopkeeper(shopkeeper.user_id)}><XCircle className="w-4 h-4 mr-1" /> Reject</Button>
                      </div>
                    </div>
                  </div>
                ))}</div>
              )}
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* User Edit Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent><DialogHeader><DialogTitle>{editingItem ? 'Edit User' : 'Add User'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Username</Label><Input value={userForm.username} onChange={(e) => setUserForm({...userForm, username: e.target.value})} disabled={!!editingItem} /></div>
              <div><Label>Email</Label><Input type="email" value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>First Name</Label><Input value={userForm.first_name} onChange={(e) => setUserForm({...userForm, first_name: e.target.value})} /></div>
              <div><Label>Last Name</Label><Input value={userForm.last_name} onChange={(e) => setUserForm({...userForm, last_name: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>User Type</Label><Select value={userForm.user_type} onValueChange={(v) => setUserForm({...userForm, user_type: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="customer">Customer</SelectItem><SelectItem value="shopkeeper">Shopkeeper</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select></div>
              <div><Label>Phone</Label><Input value={userForm.phone_number} onChange={(e) => setUserForm({...userForm, phone_number: e.target.value})} /></div>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={userForm.is_active} onChange={(e) => setUserForm({...userForm, is_active: e.target.checked})} /><Label>Active</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowUserDialog(false)}>Cancel</Button><Button onClick={handleSaveUser} disabled={isSaving}>{isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shop Edit Dialog */}
      <Dialog open={showShopDialog} onOpenChange={setShowShopDialog}>
        <DialogContent><DialogHeader><DialogTitle>Edit Shop</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={shopForm.name} onChange={(e) => setShopForm({...shopForm, name: e.target.value})} /></div>
            <div><Label>Description</Label><Input value={shopForm.description} onChange={(e) => setShopForm({...shopForm, description: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={shopForm.phone} onChange={(e) => setShopForm({...shopForm, phone: e.target.value})} /></div>
              <div><Label>Email</Label><Input value={shopForm.email} onChange={(e) => setShopForm({...shopForm, email: e.target.value})} /></div>
            </div>
            <div><Label>Address</Label><Input value={shopForm.address} onChange={(e) => setShopForm({...shopForm, address: e.target.value})} /></div>
            <div><Label>Status</Label><Select value={shopForm.status} onValueChange={(v) => setShopForm({...shopForm, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="suspended">Suspended</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowShopDialog(false)}>Cancel</Button><Button onClick={handleSaveShop} disabled={isSaving}>{isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Edit Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent><DialogHeader><DialogTitle>Edit Order</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Order Status</Label><Select value={orderForm.status} onValueChange={(v) => setOrderForm({...orderForm, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="confirmed">Confirmed</SelectItem><SelectItem value="preparing">Preparing</SelectItem><SelectItem value="ready">Ready</SelectItem><SelectItem value="out_for_delivery">Out for Delivery</SelectItem><SelectItem value="delivered">Delivered</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select></div>
            <div><Label>Payment Status</Label><Select value={orderForm.payment_status} onValueChange={(v) => setOrderForm({...orderForm, payment_status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="paid">Paid</SelectItem><SelectItem value="failed">Failed</SelectItem><SelectItem value="refunded">Refunded</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowOrderDialog(false)}>Cancel</Button><Button onClick={handleSaveOrder} disabled={isSaving}>{isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Edit Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent><DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} /></div>
            <div><Label>Description</Label><Input value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Price</Label><Input type="number" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} /></div>
              <div><Label>Stock</Label><Input type="number" value={productForm.stock_quantity} onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Status</Label><Select value={productForm.status} onValueChange={(v) => setProductForm({...productForm, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="available">Available</SelectItem><SelectItem value="out_of_stock">Out of Stock</SelectItem><SelectItem value="discontinued">Discontinued</SelectItem></SelectContent></Select></div>
              <div><Label>Category</Label><Select value={productForm.category_id} onValueChange={(v) => setProductForm({...productForm, category_id: v})}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowProductDialog(false)}>Cancel</Button><Button onClick={handleSaveProduct} disabled={isSaving}>{isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" />Confirm Logout</DialogTitle>
            <DialogDescription>Are you sure you want to logout from the admin dashboard?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" />Yes, Logout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
