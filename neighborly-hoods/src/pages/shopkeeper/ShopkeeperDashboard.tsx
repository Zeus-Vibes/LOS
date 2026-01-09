import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Store, ShoppingBag, Package, TrendingUp, Clock, Star, 
  Plus, Settings, LogOut, Bell, DollarSign, Edit, Trash2,
  CheckCircle, XCircle, AlertCircle, ShieldCheck, ShieldAlert, ShieldX, Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import shopService, { Product, Category } from "@/services/shopService";
import api from "@/lib/api";

interface ShopkeeperProfile {
  id: number;
  business_name: string;
  business_license: string;
  business_address: string;
  business_phone: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  approved_at: string | null;
}

interface ShopInfo {
  id: number;
  name: string;
  status: string;
  average_rating: number;
  total_reviews: number;
}

interface ShopStats {
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
  total_products: number;
  average_rating: number;
  total_reviews: number;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  total_amount: string;
  status: string;
  created_at: string;
  items: any[];
}

const ShopkeeperDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [shopkeeperProfile, setShopkeeperProfile] = useState<ShopkeeperProfile | null>(null);
  
  // Product form state
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category: '',
    stock_quantity: '10',
    brand: '',
    status: 'available'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user || user.user_type !== 'shopkeeper') {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch categories
      const cats = await shopService.getCategories();
      setCategories(cats);

      // Fetch shopkeeper profile
      try {
        const profileRes = await api.get('/auth/profile/shopkeeper/');
        setShopkeeperProfile(profileRes.data);
      } catch (e) {
        console.log('No shopkeeper profile found');
      }

      // Fetch shop info
      try {
        const shop = await shopService.getMyShop();
        setShopInfo(shop);
      } catch (e) {
        console.log('No shop found yet');
      }

      // Fetch products
      try {
        const prods = await shopService.getMyProducts();
        setProducts(prods);
      } catch (e) {
        console.log('No products found');
      }

      // Fetch orders
      try {
        const ords = await shopService.getMyOrders();
        setOrders(ords.slice(0, 10));
      } catch (e) {
        console.log('No orders found');
      }

      // Fetch stats
      try {
        const statsData = await shopService.getMyStats();
        setStats(statsData);
      } catch (e) {
        setStats({
          total_orders: 0,
          pending_orders: 0,
          total_revenue: 0,
          total_products: 0,
          average_rating: 0,
          total_reviews: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      discount_price: '',
      category: '',
      stock_quantity: '10',
      brand: '',
      status: 'available'
    });
    setShowProductDialog(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      discount_price: product.discount_price ? String(product.discount_price) : '',
      category: String(product.category),
      stock_quantity: String(product.stock_quantity),
      brand: product.brand || '',
      status: product.status
    });
    setShowProductDialog(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.category) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const data: Partial<Product> = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        discount_price: productForm.discount_price ? parseFloat(productForm.discount_price) : null,
        category: parseInt(productForm.category),
        stock_quantity: parseInt(productForm.stock_quantity),
        brand: productForm.brand,
        status: productForm.status as 'available' | 'out_of_stock' | 'discontinued'
      };

      if (editingProduct) {
        await shopService.updateProduct(editingProduct.id, data);
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        await shopService.addProduct(data);
        toast({ title: "Success", description: "Product added successfully" });
      }

      setShowProductDialog(false);
      fetchDashboardData();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.error || "Failed to save product", 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await shopService.deleteProduct(productId);
      toast({ title: "Success", description: "Product deleted" });
      fetchDashboardData();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.post(`/orders/orders/${orderId}/update_status/`, { status: newStatus });
      toast({ title: "Success", description: "Order status updated" });
      fetchDashboardData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update order", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready_for_pickup: 'bg-cyan-100 text-cyan-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getVerificationBadge = () => {
    const status = shopkeeperProfile?.verification_status || 'pending';
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 gap-1"><ShieldCheck className="w-3 h-3" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 gap-1"><ShieldX className="w-3 h-3" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 gap-1"><ShieldAlert className="w-3 h-3" />Pending</Badge>;
    }
  };

  const isApproved = shopkeeperProfile?.verification_status === 'approved';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-display font-bold text-xl block">LOS</span>
                <span className="text-xs text-muted-foreground">Shopkeeper</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {stats?.pending_orders ? (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.pending_orders}
                  </span>
                ) : null}
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-sm font-medium">
                  {user?.first_name?.[0] || 'S'}
                </div>
                <span className="text-sm font-medium hidden sm:block">{user?.first_name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-4">
                  <Store className="w-10 h-10 text-white" />
                </div>
                <h2 className="font-display text-lg font-semibold">
                  {shopkeeperProfile?.business_name || shopInfo?.name || 'Your Shop'}
                </h2>
                {shopInfo && (
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span>{shopInfo.average_rating || 0}</span>
                    <span>({shopInfo.total_reviews || 0})</span>
                  </div>
                )}
                <div className="mt-3">{getVerificationBadge()}</div>
              </div>

              <nav className="space-y-1">
                <Link to="/shopkeeper/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium">
                  <TrendingUp className="w-5 h-5" />Dashboard
                </Link>
                <Link to="/shopkeeper/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent">
                  <ShoppingBag className="w-5 h-5" />Orders
                  {stats?.pending_orders ? <Badge variant="destructive" className="ml-auto">{stats.pending_orders}</Badge> : null}
                </Link>
                <Link to="/shopkeeper/products" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent">
                  <Package className="w-5 h-5" />Products
                </Link>
                <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent">
                  <Settings className="w-5 h-5" />Settings
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent text-destructive">
                  <LogOut className="w-5 h-5" />Logout
                </button>
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            {/* Status Banner */}
            {!isApproved && (
              <Card className={`p-4 border ${shopkeeperProfile?.verification_status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${shopkeeperProfile?.verification_status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {shopkeeperProfile?.verification_status === 'rejected' ? <ShieldX className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${shopkeeperProfile?.verification_status === 'rejected' ? 'text-red-800' : 'text-yellow-800'}`}>
                      {shopkeeperProfile?.verification_status === 'rejected' ? 'Verification Rejected' : 'Verification Pending'}
                    </h3>
                    <p className={`text-sm ${shopkeeperProfile?.verification_status === 'rejected' ? 'text-red-700' : 'text-yellow-700'}`}>
                      {shopkeeperProfile?.verification_status === 'rejected' 
                        ? 'Your shop verification was rejected. Please contact support.'
                        : 'Your shop is under review. You can add products once approved.'}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {isApproved && (
              <Card className="p-4 border bg-green-50 border-green-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">Shop Verified!</h3>
                    <p className="text-sm text-green-700">Your shop is approved. You can now manage products and receive orders.</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.total_orders || 0}</p>
                    <p className="text-sm text-muted-foreground">Orders</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">₹{stats?.total_revenue || 0}</p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{products.length}</p>
                    <p className="text-sm text-muted-foreground">Products</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.pending_orders || 0}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="orders" className="space-y-4">
              <TabsList>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
              </TabsList>

              <TabsContent value="orders">
                <Card className="p-6">
                  <h2 className="font-display text-xl font-semibold mb-4">Recent Orders</h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50">
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.customer_name} • {order.items?.length || 0} items</p>
                            <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                          </div>
                          <div className="text-right flex items-center gap-4">
                            <div>
                              <p className="font-semibold">₹{order.total_amount}</p>
                              <Badge className={getStatusColor(order.status)}>{order.status.replace('_', ' ')}</Badge>
                            </div>
                            {order.status === 'pending' && (
                              <Button size="sm" onClick={() => updateOrderStatus(order.id, 'confirmed')}>Confirm</Button>
                            )}
                            {order.status === 'confirmed' && (
                              <Button size="sm" onClick={() => updateOrderStatus(order.id, 'preparing')}>Prepare</Button>
                            )}
                            {order.status === 'preparing' && (
                              <Button size="sm" onClick={() => updateOrderStatus(order.id, 'ready_for_pickup')}>Ready</Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="products">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl font-semibold">Your Products</h2>
                    <Button onClick={openAddProduct} disabled={!isApproved}>
                      <Plus className="w-4 h-4 mr-2" />Add Product
                    </Button>
                  </div>

                  {!isApproved && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">You can add products once your shop is approved.</p>
                    </div>
                  )}

                  {products.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No products yet</p>
                      {isApproved && <Button onClick={openAddProduct}><Plus className="w-4 h-4 mr-2" />Add First Product</Button>}
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products.map((product) => (
                        <div key={product.id} className="border rounded-lg p-4 hover:shadow-md">
                          <div className="aspect-square rounded-lg bg-accent mb-3 overflow-hidden">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <h3 className="font-medium truncate">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.category_name}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-semibold">₹{product.price}</span>
                            <Badge variant={product.status === 'available' ? 'default' : 'secondary'}>
                              {product.stock_quantity} in stock
                            </Badge>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditProduct(product)}>
                              <Edit className="w-3 h-3 mr-1" />Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>Fill in the product details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₹) *</Label>
                <Input id="price" type="number" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="discount_price">Sale Price (₹)</Label>
                <Input id="discount_price" type="number" value={productForm.discount_price} onChange={(e) => setProductForm({...productForm, discount_price: e.target.value})} />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={productForm.category} onValueChange={(v) => setProductForm({...productForm, category: v})}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input id="stock" type="number" value={productForm.stock_quantity} onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" value={productForm.brand} onChange={(e) => setProductForm({...productForm, brand: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveProduct} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingProduct ? 'Update' : 'Add'} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShopkeeperDashboard;
