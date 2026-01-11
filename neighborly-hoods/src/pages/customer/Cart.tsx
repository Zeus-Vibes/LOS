import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Store, Tag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import orderService, { Cart as CartType, CartItem } from "@/services/orderService";

const CartPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      // Visitor trying to access cart - redirect to register
      toast({ title: "Please login", description: "You need to login to view your cart" });
      navigate('/signup');
      return;
    }
    fetchCart();
  }, [isAuthenticated, authLoading]);

  const fetchCart = async () => {
    try {
      const data = await orderService.getCart();
      setCart(data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (item: CartItem, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;
    
    setUpdatingItemId(item.id);
    try {
      await orderService.updateCartItem(item.id, newQuantity);
      await fetchCart();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update quantity", variant: "destructive" });
    } finally {
      setUpdatingItemId(null);
    }
  };

  const removeItem = async (itemId: number) => {
    setUpdatingItemId(itemId);
    try {
      await orderService.removeFromCart(itemId);
      toast({ title: "Item removed", description: "Item has been removed from your cart" });
      await fetchCart();
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove item", variant: "destructive" });
    } finally {
      setUpdatingItemId(null);
    }
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "FIRST10") {
      setAppliedCoupon("FIRST10");
      toast({ title: "Coupon applied!", description: "You got 10% off on your order" });
    } else {
      toast({ title: "Invalid coupon", description: "This coupon code is not valid", variant: "destructive" });
    }
    setCouponCode("");
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast({ title: "Please login", description: "You need to login to checkout" });
      navigate('/signup');
      return;
    }
    navigate('/checkout');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const subtotal = cart?.total_amount || 0;
  const discount = appliedCoupon ? subtotal * 0.1 : 0;
  const deliveryCharge = subtotal > 500 ? 0 : 30;
  const total = subtotal - discount + deliveryCharge;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 glass-strong border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <Link to="/browse" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" /><span>Continue Shopping</span>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-display text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet</p>
          <Button size="lg" asChild className="bg-gradient-to-r from-orange-500 to-amber-500">
            <Link to="/browse">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-8">
      <header className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/browse" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" /><span className="hidden sm:inline">Continue Shopping</span>
            </Link>
            <h1 className="font-display text-lg font-semibold">Your Cart ({cartItems.length} items)</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Shop info */}
            {cartItems.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{cartItems[0].product.shop_name || 'Shop'}</h3>
                    <p className="text-sm text-muted-foreground">All items from this shop</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Items */}
            {cartItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg bg-accent flex items-center justify-center">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full rounded-lg object-cover" />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground">₹{item.product.price}/unit</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} disabled={updatingItemId === item.id} className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50">
                        {updatingItemId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item, -1)} disabled={updatingItemId === item.id || item.quantity <= 1}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button variant="default" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item, 1)} disabled={updatingItemId === item.id}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <span className="font-display font-bold">₹{item.subtotal}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Coupon */}
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3"><Tag className="w-5 h-5 text-primary" /><span className="font-medium">Apply Coupon</span></div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-green-700 font-medium">{appliedCoupon} applied</span>
                  <button onClick={() => setAppliedCoupon(null)} className="text-sm text-muted-foreground hover:text-foreground">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input placeholder="Enter coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="flex-1" />
                  <Button variant="outline" onClick={applyCoupon}>Apply</Button>
                </div>
              )}
            </Card>
          </div>

          {/* Order Summary - Desktop */}
          <div className="hidden lg:block">
            <Card className="p-6 sticky top-24">
              <h2 className="font-display text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount (10%)</span><span>-₹{discount.toFixed(0)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className={deliveryCharge === 0 ? "text-green-600" : ""}>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span></div>
                {deliveryCharge > 0 && <p className="text-xs text-muted-foreground">Free delivery on orders above ₹500</p>}
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between font-display text-lg font-bold"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
                  <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</p>
                </div>
              </div>
              <Button size="lg" className="w-full mt-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 glass-strong border-t border-border p-4 lg:hidden">
        <div className="flex items-center justify-between">
          <div><p className="text-sm text-muted-foreground">Total</p><p className="font-display text-xl font-bold">₹{total.toFixed(0)}</p></div>
          <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500" onClick={handleCheckout}>Checkout</Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
