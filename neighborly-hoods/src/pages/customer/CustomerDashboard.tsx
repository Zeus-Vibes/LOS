import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Store, ShoppingBag, Package,
  ChevronRight, User, Settings, LogOut, Heart, Bell, Loader2, MapPin, Navigation
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import orderService, { Order } from "@/services/orderService";
import shopService, { Shop } from "@/services/shopService";
import { getFullImageUrl } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import NotificationDropdown from "@/components/NotificationDropdown";
import { lazy, Suspense } from "react";

// Lazy load map component
// const MapComponent = lazy(() => import('@/components/MapComponent'));

// DUMMY MAP COMPONENT
const MapComponentPlaceholder = () => (
  <div className="h-64 flex flex-col items-center justify-center bg-muted rounded-xl text-center p-4">
    <MapPin className="w-10 h-10 text-muted-foreground mb-3" />
    <p className="text-muted-foreground font-medium">Map View Temporarily Disabled</p>
    <p className="text-xs text-muted-foreground mt-1">We're updating our neighborhood discovery features. Shop lists are still functional below.</p>
  </div>
);

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nearbyShops, setNearbyShops] = useState<Shop[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (!user || user.user_type !== 'customer') {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrders();
      console.log('Orders fetched:', data);
      setOrders(Array.isArray(data) ? data.slice(0, 5) : []); // Recent 5 orders
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      setError(error.response?.data?.error || 'Failed to load orders');
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getMyLocation = async () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          // Fetch nearby shops
          try {
            const shops = await shopService.getShops();
            // Filter shops with location within 10km
            const shopsWithLocation = shops.filter(s => s.latitude && s.longitude);
            setNearbyShops(shopsWithLocation.slice(0, 5));
          } catch (err) {
            console.error('Failed to fetch shops:', err);
          }

          setIsGettingLocation(false);
          toast({ title: "Location found!", description: "Showing nearby shops" });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({ title: "Location error", description: "Could not get your location", variant: "destructive" });
          setIsGettingLocation(false);
        }
      );
    } else {
      toast({ title: "Not supported", description: "Geolocation is not supported by your browser", variant: "destructive" });
      setIsGettingLocation(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-cyan-100 text-cyan-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-blue-500' },
    { label: 'Active Orders', value: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length, icon: Package, color: 'text-orange-500' },
    { label: 'Favorites', value: 0, icon: Heart, color: 'text-red-500' },
  ];

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
              <span className="font-display font-bold text-xl">LOS</span>
            </Link>
            <div className="flex items-center gap-4">
              <NotificationDropdown />
              <Link to="/cart">
                <Button variant="ghost" size="icon">
                  <ShoppingBag className="w-5 h-5" />
                </Button>
              </Link>
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
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-primary/10 shadow-sm">
                  {user?.profile_picture ? (
                    <img src={getFullImageUrl(user.profile_picture) || ''} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-2xl font-bold">
                      {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <h2 className="font-display text-xl font-semibold">{user?.first_name} {user?.last_name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge className="mt-2 capitalize">{user?.user_type}</Badge>
              </div>

              <nav className="space-y-1">
                <Link to="/customer/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium">
                  <User className="w-5 h-5" />
                  Dashboard
                </Link>
                <Link to="/customer/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                  My Orders
                </Link>
                <Link to="/browse" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors">
                  <Store className="w-5 h-5" />
                  Browse Shops
                </Link>
                <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors">
                  <Settings className="w-5 h-5" />
                  Settings
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-destructive">
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            {/* Welcome */}
            <Card className="p-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              <h1 className="font-display text-2xl font-bold mb-2">Welcome back, {user?.first_name || user?.username}!</h1>
              <p className="text-white/80">Ready to discover local shops in your neighborhood?</p>
              <Button className="mt-4 bg-white text-orange-600 hover:bg-white/90" asChild>
                <Link to="/browse">Browse Shops</Link>
              </Button>
            </Card>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-accent flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Recent Orders */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold">Recent Orders</h2>
                <Link to="/customer/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                  <span className="text-muted-foreground">Loading orders...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={fetchOrders} variant="outline">Try Again</Button>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No orders yet</p>
                  <Button asChild>
                    <Link to="/browse">Start Shopping</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Link to={`/order/${order.id}`} key={order.id} className="block">
                      <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                            <Package className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.items?.length || 0} items • ₹{order.total_amount}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>{order.status.replace('_', ' ')}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            {/* Nearby Shops Map */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold">Shops Near You</h2>
                    <p className="text-sm text-muted-foreground">Find shops in your area</p>
                  </div>
                </div>
                <Button onClick={getMyLocation} disabled={isGettingLocation} variant="outline">
                  {isGettingLocation ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4 mr-2" />
                  )}
                  {userLocation ? 'Refresh' : 'Find Shops'}
                </Button>
              </div>

              {userLocation ? (
                <div className="space-y-4">
                  <MapComponentPlaceholder />
                  {nearbyShops.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-2 mt-4">
                      {nearbyShops.slice(0, 4).map(shop => (
                        <Link key={shop.id} to={`/shop/${shop.id}`} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors">
                          <Store className="w-8 h-8 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{shop.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{shop.address}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center bg-muted rounded-xl">
                  <MapPin className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-center">Click "Find Shops" to see nearby stores on the map</p>
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/browse')}>
                <Store className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold mb-1">Browse Shops</h3>
                <p className="text-sm text-muted-foreground">Discover local shops near you</p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/cart')}>
                <ShoppingBag className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold mb-1">View Cart</h3>
                <p className="text-sm text-muted-foreground">Check your shopping cart</p>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
