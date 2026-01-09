import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Star, MapPin, Clock, Phone, Share2, Heart,
  Plus, Minus, ShoppingCart, Store, Grid3X3, List
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock shop data
const mockShop = {
  id: 1,
  name: "Fresh Mart",
  category: "Grocery",
  rating: 4.8,
  reviews: 245,
  distance: "0.5 km",
  address: "123, Main Street, Prahladnagar, Ahmedabad - 380015",
  phone: "+91 98765 43210",
  coverImage: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&h=400&fit=crop",
  logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop",
  isOpen: true,
  timing: "8 AM - 10 PM",
  description: "Your trusted neighborhood grocery store since 2010. We offer fresh vegetables, fruits, dairy products, and daily essentials at competitive prices.",
  yearsInBusiness: 14,
  staff: 8,
  gst: "24AAAAA0000A1Z5",
};

const mockProducts = [
  { id: 1, name: "Fresh Tomatoes", category: "Vegetables", price: 40, unit: "kg", stock: 50, image: "https://images.unsplash.com/photo-1546470427-f5c7f9f9f9f9?w=200&h=200&fit=crop" },
  { id: 2, name: "Organic Potatoes", category: "Vegetables", price: 35, unit: "kg", stock: 100, image: "https://images.unsplash.com/photo-1518977676601-b53f82ber?w=200&h=200&fit=crop" },
  { id: 3, name: "Fresh Milk", category: "Dairy", price: 60, unit: "L", stock: 30, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop" },
  { id: 4, name: "Brown Eggs", category: "Dairy", price: 80, unit: "dozen", stock: 25, image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop" },
  { id: 5, name: "Fresh Bananas", category: "Fruits", price: 50, unit: "dozen", stock: 40, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop" },
  { id: 6, name: "Red Apples", category: "Fruits", price: 180, unit: "kg", stock: 20, image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&h=200&fit=crop" },
];

const mockReviews = [
  { id: 1, user: "Rahul S.", rating: 5, date: "2 days ago", comment: "Amazing quality vegetables! Fresh and well-priced.", verified: true },
  { id: 2, user: "Priya M.", rating: 4, date: "1 week ago", comment: "Good shop, quick delivery. Could improve packaging.", verified: true },
  { id: 3, user: "Amit K.", rating: 5, date: "2 weeks ago", comment: "Best grocery store in the area. Highly recommended!", verified: true },
];

const ShopDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [cart, setCart] = useState<Record<number, number>>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFollowing, setIsFollowing] = useState(false);

  const addToCart = (productId: number) => {
    setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
    toast({
      title: "Added to cart",
      description: "Item added successfully",
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => {
      const newQty = (prev[productId] || 0) + delta;
      if (newQty <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQty };
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalAmount = Object.entries(cart).reduce((total, [id, qty]) => {
    const product = mockProducts.find(p => p.id === Number(id));
    return total + (product?.price || 0) * qty;
  }, 0);

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
          src={mockShop.coverImage}
          alt={mockShop.name}
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
                src={mockShop.logo}
                alt={mockShop.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Shop Details */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="font-display text-2xl md:text-3xl font-bold">{mockShop.name}</h1>
                    <Badge variant="verified">Verified</Badge>
                  </div>
                  <Badge variant="category">{mockShop.category}</Badge>
                </div>
                <div className="flex items-center gap-1 bg-accent px-3 py-2 rounded-xl">
                  <Star className="w-5 h-5 fill-warning text-warning" />
                  <span className="font-display font-bold text-lg">{mockShop.rating}</span>
                  <span className="text-muted-foreground text-sm">({mockShop.reviews} reviews)</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <Badge variant={mockShop.isOpen ? "open" : "closed"}>
                  {mockShop.isOpen ? "Open Now" : "Closed"}
                </Badge>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {mockShop.timing}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {mockShop.distance}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${mockShop.phone}`}>
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
              {mockProducts.map((product) => (
                <Card
                  key={product.id}
                  className={`overflow-hidden group ${viewMode === "list" ? "flex" : ""}`}
                >
                  <div className={`relative ${viewMode === "list" ? "w-32 shrink-0" : "aspect-square"}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.stock < 10 && (
                      <Badge variant="warning" className="absolute top-2 right-2 text-xs">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                  <div className="p-3 flex-1">
                    <h3 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-display font-bold">₹{product.price}</span>
                        <span className="text-xs text-muted-foreground">/{product.unit}</span>
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
                        >
                          <Plus className="w-4 h-4" />
                          Add
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
              <h2 className="font-display text-xl font-semibold mb-4">About {mockShop.name}</h2>
              <p className="text-muted-foreground mb-6">{mockShop.description}</p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Shop Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-muted-foreground" />
                      <span>{mockShop.yearsInBusiness} years in business</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <span>{mockShop.timing}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
                      <span>{mockShop.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <span>{mockShop.phone}</span>
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
                  <div className="font-display text-4xl font-bold">{mockShop.rating}</div>
                  <div className="flex items-center gap-1 justify-center my-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i <= Math.floor(mockShop.rating) ? "fill-warning text-warning" : "text-muted"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{mockShop.reviews} reviews</p>
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
              {mockReviews.map((review) => (
                <Card key={review.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.user}</span>
                        {review.verified && (
                          <Badge variant="success" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
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
