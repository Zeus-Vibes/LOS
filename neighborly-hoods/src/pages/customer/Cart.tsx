import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Store, Tag
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock cart data
const initialCartItems = [
  { id: 1, name: "Fresh Tomatoes", price: 40, quantity: 2, unit: "kg", shopId: 1, shopName: "Fresh Mart", image: "https://images.unsplash.com/photo-1546470427-f5c7f9f9f9f9?w=100&h=100&fit=crop" },
  { id: 3, name: "Fresh Milk", price: 60, quantity: 1, unit: "L", shopId: 1, shopName: "Fresh Mart", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&h=100&fit=crop" },
  { id: 5, name: "Fresh Bananas", price: 50, quantity: 2, unit: "dozen", shopId: 1, shopName: "Fresh Mart", image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=100&h=100&fit=crop" },
];

const Cart = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
    });
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "FIRST10") {
      setAppliedCoupon("FIRST10");
      toast({
        title: "Coupon applied!",
        description: "You got 10% off on your order",
      });
    } else {
      toast({
        title: "Invalid coupon",
        description: "This coupon code is not valid",
        variant: "destructive",
      });
    }
    setCouponCode("");
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedCoupon ? subtotal * 0.1 : 0;
  const deliveryCharge = subtotal > 500 ? 0 : 30;
  const total = subtotal - discount + deliveryCharge;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 glass-strong border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <Link to="/browse" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-display text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added anything yet
          </p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/browse">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/browse" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Continue Shopping</span>
            </Link>
            <h1 className="font-display text-lg font-semibold">
              Your Cart ({cartItems.length} items)
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Shop info */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{cartItems[0].shopName}</h3>
                  <p className="text-sm text-muted-foreground">All items from this shop</p>
                </div>
              </div>
            </Card>

            {/* Items */}
            {cartItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ₹{item.price}/{item.unit}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="iconSm"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="default"
                          size="iconSm"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <span className="font-display font-bold">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Coupon */}
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Tag className="w-5 h-5 text-primary" />
                <span className="font-medium">Apply Coupon</span>
              </div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
                  <span className="text-success font-medium">{appliedCoupon} applied</span>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={applyCoupon}>
                    Apply
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Try "FIRST10" for 10% off your first order
              </p>
            </Card>
          </div>

          {/* Order Summary - Desktop */}
          <div className="hidden lg:block">
            <Card className="p-6 sticky top-24">
              <h2 className="font-display text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount (10%)</span>
                    <span>-₹{discount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
                </div>
                {deliveryCharge > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Free delivery on orders above ₹500
                  </p>
                )}
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between font-display text-lg font-bold">
                    <span>Total</span>
                    <span>₹{total.toFixed(0)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Inclusive of all taxes
                  </p>
                </div>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full mt-6"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 glass-strong border-t border-border p-4 lg:hidden">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="font-display text-xl font-bold">₹{total.toFixed(0)}</p>
          </div>
          <Button
            variant="hero"
            size="lg"
            onClick={() => navigate("/checkout")}
          >
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
