import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Store, Package, ShoppingCart, DollarSign, TrendingUp,
  Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, LogOut,
  BarChart3, Star, Eye, UserCheck, Settings, Bell, Search
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import adminService, {
  DashboardStats, RecentOrder, RecentUser, PendingShopkeeper,
  TopShop, TopProduct, RevenueData
} from "@/services/adminService";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#eab308', '#ef4444'];

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
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    console.log('Admin Dashboard - Auth check:', { isAuthenticated, userType: user?.user_type });
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }
    
    if (user?.user_type !== 'admin') {
      console.log('Not admin, redirecting to browse');
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page",
        variant: "destructive",
      });
      navigate('/browse', { replace: true });
      return;
    }
    
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      const [statsData, ordersData, usersData, pendingData, shopsData, productsData, chartData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentOrders(),
        adminService.getRecentUsers(),
        adminService.getPendingShopkeepers(),
        adminService.getTopShops(),
        adminService.getTopProducts(),
        adminService.getRevenueChart(),
      ]);
      setStats(statsData);
      setRecentOrders(ordersData);
      setRecentUsers(usersData);
      setPendingShopkeepers(pendingData);
      setTopShops(shopsData);
      setTopProducts(productsData);
      setRevenueData(chartData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };


  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
    toast({ title: "Dashboard refreshed", description: "Data updated successfully" });
  };

  const handleApproveShopkeeper = async (id: number) => {
    try {
      await adminService.approveShopkeeper(id);
      toast({ title: "Shopkeeper approved", description: "The shopkeeper has been verified" });
      fetchDashboardData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve shopkeeper", variant: "destructive" });
    }
  };

  const handleRejectShopkeeper = async (id: number) => {
    try {
      await adminService.rejectShopkeeper(id);
      toast({ title: "Shopkeeper rejected", description: "The shopkeeper application has been rejected" });
      fetchDashboardData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject shopkeeper", variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  // Show loading while checking auth or loading data
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{authLoading ? 'Checking authentication...' : 'Loading dashboard...'}</p>
        </div>
      </div>
    );
  }

  // Don't render if not admin
  if (!isAuthenticated || user?.user_type !== 'admin') {
    return null;
  }

  const orderStatusData = stats ? [
    { name: 'Pending', value: stats.orders.pending, color: '#eab308' },
    { name: 'Completed', value: stats.orders.completed, color: '#22c55e' },
    { name: 'Cancelled', value: stats.orders.cancelled, color: '#ef4444' },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">LOS Admin</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon"><Bell className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon"><Settings className="w-5 h-5" /></Button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-medium">
                  {user?.first_name?.[0] || 'A'}
                </div>
                <span className="text-sm font-medium">{user?.username}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut className="w-5 h-5" /></Button>
            </div>
          </div>
        </div>
      </header>


      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats?.revenue.total || 0)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Today's Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats?.revenue.today || 0)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Orders</p>
                  <p className="text-2xl font-bold">{stats?.orders.total || 0}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-violet-500 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Users</p>
                  <p className="text-2xl font-bold">{stats?.users.total || 0}</p>
                </div>
                <Users className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-pink-500 to-rose-500 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm">Active Shops</p>
                  <p className="text-2xl font-bold">{stats?.shops.active || 0}</p>
                </div>
                <Store className="w-8 h-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm">Products</p>
                  <p className="text-2xl font-bold">{stats?.products.total || 0}</p>
                </div>
                <Package className="w-8 h-8 text-cyan-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white shadow-sm border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="shops">Shops</TabsTrigger>
            <TabsTrigger value="approvals">Approvals {pendingShopkeepers.length > 0 && <Badge className="ml-2 bg-red-500">{pendingShopkeepers.length}</Badge>}</TabsTrigger>
          </TabsList>


          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <Card className="lg:col-span-2 shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" />Revenue Trend (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                      <Tooltip formatter={(val: number) => [`₹${val}`, 'Revenue']} labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN')} />
                      <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Order Status Pie */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" />Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {orderStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {orderStatusData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-muted-foreground">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center"><Clock className="w-6 h-6 text-yellow-600" /></div>
                  <div><p className="text-2xl font-bold">{stats?.orders.pending || 0}</p><p className="text-sm text-muted-foreground">Pending Orders</p></div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center"><CheckCircle className="w-6 h-6 text-green-600" /></div>
                  <div><p className="text-2xl font-bold">{stats?.orders.completed || 0}</p><p className="text-sm text-muted-foreground">Completed</p></div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center"><AlertCircle className="w-6 h-6 text-orange-600" /></div>
                  <div><p className="text-2xl font-bold">{stats?.shops.pending_verification || 0}</p><p className="text-sm text-muted-foreground">Pending Approvals</p></div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center"><XCircle className="w-6 h-6 text-red-600" /></div>
                  <div><p className="text-2xl font-bold">{stats?.products.out_of_stock || 0}</p><p className="text-sm text-muted-foreground">Out of Stock</p></div>
                </CardContent>
              </Card>
            </div>


            {/* Top Shops & Products */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0">
                <CardHeader><CardTitle className="flex items-center gap-2"><Store className="w-5 h-5 text-primary" />Top Performing Shops</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topShops.length > 0 ? topShops.map((shop, index) => (
                      <div key={shop.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">{index + 1}</div>
                          <div>
                            <p className="font-medium">{shop.name}</p>
                            <p className="text-sm text-muted-foreground">{shop.total_orders} orders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(shop.total_revenue)}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{shop.average_rating}</div>
                        </div>
                      </div>
                    )) : <p className="text-center text-muted-foreground py-8">No shop data available</p>}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-primary" />Top Selling Products</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.length > 0 ? topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">{index + 1}</div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.shop}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{product.total_sold} sold</p>
                          <p className="text-sm text-green-600">{formatCurrency(product.total_revenue)}</p>
                        </div>
                      </div>
                    )) : <p className="text-center text-muted-foreground py-8">No product data available</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0">
                <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" />Recent Orders</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">#{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">{order.customer_name} • {order.shop}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(order.total_amount)}</p>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" />Recent Users</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentUsers.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white font-medium">{user.full_name[0]}</div>
                          <div>
                            <p className="font-medium">{user.full_name || user.username}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Badge className={user.user_type === 'shopkeeper' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>{user.user_type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>


          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="shadow-lg border-0">
              <CardHeader><CardTitle>All Orders</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Order #</th>
                        <th className="text-left p-3 font-medium">Customer</th>
                        <th className="text-left p-3 font-medium">Shop</th>
                        <th className="text-left p-3 font-medium">Amount</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Payment</th>
                        <th className="text-left p-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-slate-50">
                          <td className="p-3 font-medium">#{order.order_number}</td>
                          <td className="p-3">{order.customer_name}</td>
                          <td className="p-3">{order.shop}</td>
                          <td className="p-3 font-bold">{formatCurrency(order.total_amount)}</td>
                          <td className="p-3"><Badge className={getStatusColor(order.status)}>{order.status}</Badge></td>
                          <td className="p-3"><Badge className={getStatusColor(order.payment_status)}>{order.payment_status}</Badge></td>
                          <td className="p-3 text-muted-foreground">{formatDate(order.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="shadow-lg border-0">
              <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">User</th>
                        <th className="text-left p-3 font-medium">Email</th>
                        <th className="text-left p-3 font-medium">Type</th>
                        <th className="text-left p-3 font-medium">Verified</th>
                        <th className="text-left p-3 font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-slate-50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white text-sm">{user.full_name[0]}</div>
                              <span className="font-medium">{user.full_name || user.username}</span>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">{user.email}</td>
                          <td className="p-3"><Badge className={user.user_type === 'admin' ? 'bg-red-100 text-red-800' : user.user_type === 'shopkeeper' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>{user.user_type}</Badge></td>
                          <td className="p-3">{user.is_verified ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-gray-300" />}</td>
                          <td className="p-3 text-muted-foreground">{formatDate(user.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Shops Tab */}
          <TabsContent value="shops">
            <Card className="shadow-lg border-0">
              <CardHeader><CardTitle>All Shops</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topShops.map((shop) => (
                    <Card key={shop.id} className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">{shop.name[0]}</div>
                          <Badge className={getStatusColor(shop.status)}>{shop.status}</Badge>
                        </div>
                        <h3 className="font-bold text-lg mb-1">{shop.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">Owner: {shop.owner}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />{shop.average_rating}</div>
                          <div>{shop.total_orders} orders</div>
                          <div className="font-bold text-green-600">{formatCurrency(shop.total_revenue)}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals">
            <Card className="shadow-lg border-0">
              <CardHeader><CardTitle className="flex items-center gap-2"><UserCheck className="w-5 h-5" />Pending Shopkeeper Approvals</CardTitle></CardHeader>
              <CardContent>
                {pendingShopkeepers.length > 0 ? (
                  <div className="space-y-4">
                    {pendingShopkeepers.map((shopkeeper) => (
                      <Card key={shopkeeper.id} className="shadow-sm border-l-4 border-l-yellow-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold">{shopkeeper.business_name[0]}</div>
                                <div>
                                  <h3 className="font-bold text-lg">{shopkeeper.business_name}</h3>
                                  <p className="text-sm text-muted-foreground">@{shopkeeper.username}</p>
                                </div>
                              </div>
                              <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{shopkeeper.email}</p></div>
                                <div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{shopkeeper.business_phone}</p></div>
                                <div className="md:col-span-2"><p className="text-sm text-muted-foreground">Address</p><p className="font-medium">{shopkeeper.business_address}</p></div>
                                {shopkeeper.business_license && <div><p className="text-sm text-muted-foreground">License</p><p className="font-medium">{shopkeeper.business_license}</p></div>}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button onClick={() => handleApproveShopkeeper(shopkeeper.id)} className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-4 h-4 mr-2" />Approve</Button>
                              <Button onClick={() => handleRejectShopkeeper(shopkeeper.id)} variant="outline" className="text-red-500 border-red-500 hover:bg-red-50"><XCircle className="w-4 h-4 mr-2" />Reject</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">All caught up!</h3>
                    <p className="text-muted-foreground">No pending shopkeeper approvals</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;