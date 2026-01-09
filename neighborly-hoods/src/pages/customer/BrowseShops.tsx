import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, MapPin, Filter, Grid3X3, List, Star, Clock, 
  ChevronDown, X, ShoppingCart, Bell, Store, Loader2,
  LayoutDashboard, Settings, LogOut, ShoppingBag, Package, Navigation
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import shopService, { Shop, Category, Product } from "@/services/shopService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

const BrowseShops = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchMode, setSearchMode] = useState<"shops" | "products">("shops");
  const [showFilters, setShowFilters] = useState(false);
  const [distanceRange, setDistanceRange] = useState([10]);
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locationName, setLocationName] = useState("Your Area");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Helper function to check if shop is open - defined before use
  const isShopOpen = (shop: Shop): boolean => {
    if (!shop) return false;
    if (shop.is_open_24_7) return true;
    if (!shop.opening_time || !shop.closing_time) return true;
    
    try {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [openHour, openMin] = shop.opening_time.split(':').map(Number);
      const [closeHour, closeMin] = shop.closing_time.split(':').map(Number);
      const openTime = openHour * 60 + openMin;
      const closeTime = closeHour * 60 + closeMin;
      return currentTime >= openTime && currentTime <= closeTime;
    } catch {
      return true; // Default to open if parsing fails
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.user_type) {
      case 'admin': return '/admin';
      case 'shopkeeper': return '/shopkeeper/dashboard';
      case 'customer': return '/customer/dashboard';
      default: return '/browse';
    }
  };

  // Get user's location
  const getUserLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Try to get location name using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const area = data.address?.suburb || data.address?.neighbourhood || data.address?.city || "Your Area";
            setLocationName(area);
          } catch {
            setLocationName("Current Location");
          }
          
          toast({ title: "Location updated", description: "Showing shops near you" });
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({ title: "Location error", description: "Could not get your location", variant: "destructive" });
          setIsGettingLocation(false);
        }
      );
    } else {
      toast({ title: "Not supported", description: "Geolocation is not supported by your browser", variant: "destructive" });
      setIsGettingLocation(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [shopsData, categoriesData, productsData] = await Promise.all([
          shopService.getShops(),
          shopService.getCategories(),
          shopService.getProducts(),
        ]);
        setShops(shopsData);
        setCategories(categoriesData);
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryNames = ["All", ...categories.map(c => c.name)];

  const filteredShops = shops.filter((shop) => {
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || 
      shop.categories.some(c => c.name === selectedCategory);
    const matchesRating = minRating === null || shop.average_rating >= minRating;
    const matchesDistance = shop.delivery_radius <= distanceRange[0];
    const matchesOpenNow = !showOpenOnly || isShopOpen(shop);
    return matchesSearch && matchesCategory && matchesRating && matchesDistance && matchesOpenNow;
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || 
      product.category_name === selectedCategory;
    const matchesRating = minRating === null || product.average_rating >= minRating;
    return matchesSearch && matchesCategory && matchesRating;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl hidden sm:block">LOS</span>
            </Link>

            <button 
              onClick={getUserLocation}
              disabled={isGettingLocation}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              {isGettingLocation ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <MapPin className="w-5 h-5 text-primary" />
              )}
              <span className="text-sm font-medium hidden md:inline">{locationName}</span>
              <Navigation className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="flex-1 max-w-xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search shops or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>

            {/* Spacer to push items to the right */}
            <div className="flex-1"></div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
              </Button>
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="w-5 h-5" />
                </Button>
              </Link>
              
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-accent rounded-lg hover:bg-accent/80 transition-colors">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-sm font-medium">
                        {user.first_name?.[0] || user.username?.[0] || 'U'}
                      </div>
                      <span className="text-sm font-medium hidden sm:block">{user.first_name || user.username}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{user.first_name} {user.last_name}</span>
                        <span className="text-xs text-muted-foreground capitalize">{user.user_type}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardLink()} className="cursor-pointer">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {user.user_type === 'customer' && (
                      <DropdownMenuItem asChild>
                        <Link to="/customer/orders" className="cursor-pointer">
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="w-64 shrink-0 hidden lg:block">
            <Card className="p-4 sticky top-24">
              <h3 className="font-display font-semibold mb-4">Filters</h3>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3">Categories</h4>
                <div className="space-y-2">
                  {categoryNames.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3">Distance</h4>
                <Slider value={distanceRange} onValueChange={setDistanceRange} max={10} min={1} step={0.5} className="mb-2" />
                <p className="text-sm text-muted-foreground">Within {distanceRange[0]} km</p>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3">Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2].map((rating) => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox 
                        checked={minRating === rating}
                        onCheckedChange={(checked) => setMinRating(checked ? rating : null)}
                      />
                      <span className="text-sm flex items-center gap-1">
                        {rating}+ <Star className="w-3 h-3 fill-warning text-warning" />
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox checked={showOpenOnly} onCheckedChange={(checked) => setShowOpenOnly(checked === true)} />
                <label className="text-sm cursor-pointer">Open Now</label>
              </div>
            </Card>
          </aside>

          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-2xl font-bold mb-1">
                  {searchMode === "shops" ? "Shops Near You" : "Products"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isLoading ? "Loading..." : 
                    searchMode === "shops" 
                      ? `${filteredShops.length} shops found`
                      : `${filteredProducts.length} products found`
                  }
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>

                <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                  <button onClick={() => setViewMode("grid")} className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-card shadow-sm" : ""}`}>
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode("list")} className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-card shadow-sm" : ""}`}>
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs for Shops/Products */}
            <Tabs value={searchMode} onValueChange={(v) => setSearchMode(v as "shops" | "products")} className="mb-6">
              <TabsList>
                <TabsTrigger value="shops" className="gap-2">
                  <Store className="w-4 h-4" />
                  Shops ({filteredShops.length})
                </TabsTrigger>
                <TabsTrigger value="products" className="gap-2">
                  <Package className="w-4 h-4" />
                  Products ({filteredProducts.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2 overflow-x-auto pb-4 lg:hidden scrollbar-hide">
              {categoryNames.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : searchMode === "shops" ? (
              /* Shops Grid */
              <>
                <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                  {filteredShops.map((shop) => {
                    const shopOpen = isShopOpen(shop);
                    return (
                      <Link to={`/shop/${shop.id}`} key={shop.id}>
                        <Card variant="elevated" className={`overflow-hidden group hover-lift ${viewMode === "list" ? "flex" : ""}`}>
                          <div className={`relative overflow-hidden ${viewMode === "list" ? "w-48 shrink-0" : "aspect-[4/3]"}`}>
                            <img
                              src={shop.banner_image || "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop"}
                              alt={shop.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <Badge variant={shopOpen ? "open" : "closed"} className="absolute top-3 left-3">
                              {shopOpen ? "Open" : "Closed"}
                            </Badge>
                          </div>

                          <div className="p-4 flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">
                                  {shop.name}
                                </h3>
                                <div className="flex gap-1 mt-1">
                                  {shop.categories.slice(0, 2).map(cat => (
                                    <Badge key={cat.id} variant="category">{cat.name}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 bg-accent px-2 py-1 rounded-lg">
                                <Star className="w-4 h-4 fill-warning text-warning" />
                                <span className="font-medium text-sm">{shop.average_rating}</span>
                                <span className="text-xs text-muted-foreground">({shop.total_reviews})</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {shop.delivery_radius} km
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {shop.is_open_24_7 ? "24 Hours" : `${shop.opening_time} - ${shop.closing_time}`}
                              </span>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">{shop.description}</p>
                            
                            {shop.offers_delivery && (
                              <div className="mt-2 text-xs text-primary">
                                🚚 Delivery available • Min ₹{shop.minimum_order_amount} • Fee ₹{shop.delivery_fee}
                              </div>
                            )}
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>

                {filteredShops.length === 0 && (
                  <div className="text-center py-16">
                    <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-xl font-semibold mb-2">No shops found</h3>
                    <p className="text-muted-foreground mb-6">Try adjusting your filters or search query</p>
                    <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setShowOpenOnly(false); setMinRating(null); }}>
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                )}
              </>
            ) : (
              /* Products Grid */
              <>
                <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "grid-cols-1"}`}>
                  {filteredProducts.map((product) => (
                    <Link to={`/shop/${product.shop}?product=${product.id}`} key={product.id}>
                      <Card variant="elevated" className={`overflow-hidden group hover-lift ${viewMode === "list" ? "flex" : ""}`}>
                        <div className={`relative overflow-hidden ${viewMode === "list" ? "w-40 shrink-0" : "aspect-square"}`}>
                          <img
                            src={product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {product.is_on_sale && product.discount_price && (
                            <Badge className="absolute top-3 left-3 bg-red-500">
                              Sale
                            </Badge>
                          )}
                          {product.is_featured && (
                            <Badge className="absolute top-3 right-3 bg-amber-500">
                              Featured
                            </Badge>
                          )}
                        </div>

                        <div className="p-4 flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-display font-semibold text-base group-hover:text-primary transition-colors truncate">
                                {product.name}
                              </h3>
                              <p className="text-xs text-muted-foreground">{product.shop_name}</p>
                              {product.brand && (
                                <p className="text-xs text-muted-foreground">Brand: {product.brand}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 bg-accent px-2 py-1 rounded-lg ml-2">
                              <Star className="w-3 h-3 fill-warning text-warning" />
                              <span className="font-medium text-xs">{product.average_rating}</span>
                            </div>
                          </div>

                          <Badge variant="category" className="mb-2">{product.category_name}</Badge>

                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {product.is_on_sale && product.discount_price ? (
                                <>
                                  <span className="font-bold text-lg text-primary">₹{product.discount_price}</span>
                                  <span className="text-sm text-muted-foreground line-through">₹{product.price}</span>
                                </>
                              ) : (
                                <span className="font-bold text-lg">₹{product.price}</span>
                              )}
                            </div>
                            <Badge variant={product.status === 'available' ? 'default' : 'secondary'}>
                              {product.status === 'available' ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-16">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-xl font-semibold mb-2">No products found</h3>
                    <p className="text-muted-foreground mb-6">Try adjusting your filters or search query</p>
                    <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setMinRating(null); }}>
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default BrowseShops;
