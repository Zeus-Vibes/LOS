import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, MapPin, Smartphone, Wallet, ShieldCheck, Loader2, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import orderService, { Cart } from "@/services/orderService";

const paymentMethods = [
  { id: "online_payment", name: "UPI Payment", icon: Smartphone, description: "Pay using any UPI app (GPay, PhonePe, Paytm)" },
  { id: "cash_on_delivery", name: "Cash on Delivery", icon: Wallet, description: "Pay when you receive your order" },
];

const Checkout = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("cash_on_delivery");
  const [upiId, setUpiId] = useState("");
  
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: user?.address || "",
    phone: user?.phone_number || "",
    instructions: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast({ title: "Please login", description: "You need to login to checkout", variant: "destructive" });
      navigate('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setDeliveryInfo(prev => ({
        ...prev,
        address: prev.address || user.address || "",
        phone: prev.phone || user.phone_number || "",
      }));
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const data = await orderService.getCart();
      if (!data.items || data.items.length === 0) {
        toast({ title: "Cart is empty", description: "Add items to your cart first" });
        navigate('/browse');
        return;
      }
      setCart(data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast({ title: "Error", description: "Failed to load cart", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!deliveryInfo.address.trim()) {
      toast({ title: "Error", description: "Please enter delivery address", variant: "destructive" });
      return;
    }
    if (!deliveryInfo.phone.trim()) {
      toast({ title: "Error", description: "Please enter phone number", variant: "destructive" });
      return;
    }
    if (selectedPayment === "online_payment" && !upiId.trim()) {
      toast({ title: "Error", description: "Please enter UPI ID", variant: "destructive" });
      return;
    }

    setIsPlacingOrder(true);
    try {
      const result = await orderService.checkout({
        delivery_address: deliveryInfo.address,
        delivery_phone: deliveryInfo.phone,
        delivery_instructions: deliveryInfo.instructions,
        payment_method: selectedPayment as 'cash_on_delivery' | 'online_payment' | 'wallet',
      });
      
      toast({ title: "Order placed successfully!", description: result.message });
      
      if (result.orders && result.orders.length > 0) {
        navigate(`/order-confirmation/${result.orders[0].id}`);
      } else {
        navigate('/customer/orders');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({ title: "Error", description: error.response?.data?.error || "Failed to place order", variant: "destructive" });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-4">Add items to your cart to checkout</p>
        <Button asChild><Link to="/browse">Browse Shops</Link></Button>
      </div>
    );
  }

  const subtotal = cart.total_amount || 0;
  const deliveryCharge = subtotal > 500 ? 0 : 30;
  const total = subtotal + deliveryCharge;

  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-8">
      <header className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/cart" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Cart</span>
            </Link>
            <h1 className="font-display text-lg font-semibold">Checkout</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                Delivery Details
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea id="address" placeholder="Enter your full delivery address" value={deliveryInfo.address} onChange={(e) => setDeliveryInfo({...deliveryInfo, address: e.target.value})} className="min-h-[80px]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" type="tel" placeholder="+91 98765 43210" value={deliveryInfo.phone} onChange={(e) => setDeliveryInfo({...deliveryInfo, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                  <Input id="instructions" placeholder="Any special instructions for delivery" value={deliveryInfo.instructions} onChange={(e) => setDeliveryInfo({...deliveryInfo, instructions: e.target.value})} />
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
                <Wallet className="w-5 h-5 text-primary" />
                Payment Method
              </h2>
              <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment} className="space-y-3">
                {paymentMethods.map((method) => (
                  <label key={method.id} htmlFor={`pay-${method.id}`} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPayment === method.id ? "border-primary bg-accent/50" : "border-border hover:border-primary/50"}`}>
                    <RadioGroupItem value={method.id} id={`pay-${method.id}`} />
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <method.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
              {selectedPayment === "online_payment" && (
                <div className="mt-4 p-4 bg-muted/30 rounded-xl">
                  <Label>Enter UPI ID</Label>
                  <Input placeholder="yourname@upi" className="mt-2" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-2">You will receive a payment request on your UPI app</p>
                </div>
              )}
            </Card>
          </div>

          {/* Order Summary */}
          <div className="hidden lg:block">
            <Card className="p-6 sticky top-24">
              <h2 className="font-display text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.product.name} x {item.quantity}</span>
                    <span>₹{item.subtotal}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className={deliveryCharge === 0 ? "text-green-600" : ""}>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span></div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between font-display text-lg font-bold"><span>Total</span><span>₹{total}</span></div>
                </div>
              </div>
              <Button variant="default" size="lg" className="w-full mt-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                {isPlacingOrder ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Placing Order...</> : `Place Order • ₹${total}`}
              </Button>
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4" /><span>100% Secure Payment</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 glass-strong border-t border-border p-4 lg:hidden">
        <div className="flex items-center justify-between">
          <div><p className="text-sm text-muted-foreground">Total</p><p className="font-display text-xl font-bold">₹{total}</p></div>
          <Button className="bg-gradient-to-r from-orange-500 to-amber-500" size="lg" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
            {isPlacingOrder ? "Placing..." : "Place Order"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
