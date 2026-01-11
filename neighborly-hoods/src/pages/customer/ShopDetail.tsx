import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Star, MapPin, Clock, Phone, Share2, Heart,
  Plus, Minus, ShoppingCart, Store, Grid3X3, List, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import shopService from "@/services/shopService";
import orderService from "@/services/orderService";

const ShopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFollowing, setIsFollowing] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      fetchShopData();
    }
  }, [id]);

  const fetchShopData = async () => {
    try {
      const [shopData, productsData] = await Promise.all([
        shopService.getShop(Number(id)),
        shopService.getShopProducts(Number(id))
      ]);
      setShop(shopData);
      setProducts(productsData);
      // Try to fetch reviews if available
      try {
        const reviewsData = await shopService.getShopReviews(Number(id));
        // Handle both array and paginated response
        setReviews(Array.isArray(reviewsData) ? reviewsData : (reviewsData?.results || []));
      } catch {
        setReviews([]);
      }
    } catch (error) {
      console.error('Failed to fetch shop:', error);
      toast({ title: "Error", description: "Failed to load shop details", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: number) => {
    if (!isAuthenticated) {
      toast({ title: "Please login", description: "You need to login to add items to cart" });
      navigate('/signup');
      return;
    }
    
    setAddingToCart(productId);
    try {
      await orderService.addToCart(productId, 1);
      setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
      toast({ title: "Added to cart", description: "Item added successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to add to cart", variant: "destructive" });
    } finally {
      setAddingToCart(null);
    }
  };

  const updateQuantity = async (productId: number, delta: number) => {
    if (!isAuthenticated) {
      toast({ title: "Please login", description: "You need to login to modify cart" });
      navigate('/signup');
      return;
    }

    const newQty = (cart[productId] || 0) + delta;
    if (newQty <= 0) {
      setCart(prev => {
        const { [productId]: _, ...rest } = prev;
        return rest;
      });
      return;
    }
    setCart(prev => ({ ...prev, [productId]: newQty }));
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalAmount = Object.entries(cart).reduce((total, [id, qty]) => {
    const product = products.find(p => p.id === Number(id));
    return total + (product?.price || 0) * qty;
  }, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Store className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Shop not found</h2>
        <Button asChild><Link to="/browse">Browse Shops</Link></Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/browse" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to shops</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFollowing(!isFollowing)}
              >
                <Heart className={`w-5 h-5 ${isFollowing ? "fill-destructive text-destructive" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      <div className="relative h-48 md:h-64">
        <img
          src={shop.banner_image || "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&h=400&fit=crop"}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Shop Info */}
      <div className="container mx-auto px-4 -mt-16 relative">
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            {/* Shop Logo */}
            <div className="w-24 h-24 rounded-xl overflow-hidden border-4 border-card shadow-lg shrink-0">
              <img
                src={shop.logo || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop"}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Shop Details */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="font-display text-2xl md:text-3xl font-bold">{shop.name}</h1>
                    <Badge variant="verified">Verified</Badge>
                  </div>
                  <Badge variant="category">{shop.category || 'Shop'}</Badge>
                </div>
                <div className="flex items-center gap-1 bg-accent px-3 py-2 rounded-xl">
                  <Star className="w-5 h-5 fill-warning text-warning" />
                  <span className="font-display font-bold text-lg">{shop.average_rating || 0}</span>
                  <span className="text-muted-foreground text-sm">({shop.total_reviews || 0} reviews)</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <Badge variant={shop.status === 'active' ? "open" : "closed"}>
                  {shop.status === 'active' ? "Open Now" : "Closed"}
                </Badge>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {shop.opening_time} - {shop.closing_time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {shop.distance || 'Nearby'}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${shop.phone}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call Shop
                  </a>
                </Button>
                <Button variant="outline" size="sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="products" className="mb-20">
          <TabsList className="w-full justify-start bg-card border border-border p-1 rounded-xl h-auto">
            <TabsTrigger value="products" className="flex-1 sm:flex-none">Products</TabsTrigger>
            <TabsTrigger value="about" className="flex-1 sm:flex-none">About</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1 sm:flex-none">Reviews</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">All Products</h2>
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-card shadow-sm" : ""}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-card shadow-sm" : ""}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className={`grid gap-4 ${
              viewMode === "grid"
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-1"
            }`}>
              {products.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <Store className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No products available</p>
                </div>
              ) : products.map((product) => (
                <Card
                  key={product.id}
                  className={`overflow-hidden group ${viewMode === "list" ? "flex" : ""}`}
                >
                  <div className={`relative ${viewMode === "list" ? "w-32 shrink-0" : "aspect-square"}`}>
                    <img
                      src={product.image || "https://images.unsplash.com/photo-1546470427-f5c7f9f9f9f9?w=200&h=200&fit=crop"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.stock_quantity < 10 && (
                      <Badge variant="warning" className="absolute top-2 right-2 text-xs">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                  <div className="p-3 flex-1">
                    <h3 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">{product.category_name || 'Product'}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-display font-bold">₹{product.price}</span>
                        <span className="text-xs text-muted-foreground">/unit</span>
                      </div>
                      {cart[product.id] ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="iconSm"
                            onClick={() => updateQuantity(product.id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center font-medium">{cart[product.id]}</span>
                          <Button
                            variant="default"
                            size="iconSm"
                            onClick={() => updateQuantity(product.id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => addToCart(product.id)}
                          disabled={addingToCart === product.id}
                        >
                          {addingToCart === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <><Plus className="w-4 h-4" />Add</>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="mt-6">
            <Card className="p-6">
              <h2 className="font-display text-xl font-semibold mb-4">About {shop.name}</h2>
              <p className="text-muted-foreground mb-6">{shop.description || 'Welcome to our shop!'}</p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Shop Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-muted-foreground" />
                      <span>Local neighborhood shop</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <span>{shop.opening_time} - {shop.closing_time}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
                      <span>{shop.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <span>{shop.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Map placeholder */}
                <div className="h-48 bg-muted rounded-xl flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Map view</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            <Card className="p-6 mb-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="font-display text-4xl font-bold">{shop.average_rating || 0}</div>
                  <div className="flex items-center gap-1 justify-center my-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i <= Math.floor(shop.average_rating || 0) ? "fill-warning text-warning" : "text-muted"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{shop.total_reviews || 0} reviews</p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-3">{rating}</span>
                      <Star className="w-3 h-3 fill-warning text-warning" />
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-warning rounded-full"
                          style={{ width: `${rating * 20}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              {reviews.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No reviews yet</p>
                </Card>
              ) : reviews.map((review) => (
                <Card key={review.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.customer_name || review.user}</span>
                        {review.is_verified && (
                          <Badge variant="success" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i <= review.rating ? "fill-warning text-warning" : "text-muted"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <Link to="/cart">
            <Card className="p-4 gradient-primary text-primary-foreground flex items-center justify-between shadow-xl shadow-primary/25">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">{totalItems} items</p>
                  <p className="text-sm opacity-80">₹{totalAmount}</p>
                </div>
              </div>
              <Button variant="secondary" size="lg">
                View Cart
              </Button>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ShopDetail;
