import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  ArrowLeft, MapPin, Plus, CreditCard, Smartphone, Building2, 
  Wallet, Check, ShieldCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const savedAddresses = [
  { id: 1, type: "Home", name: "John Doe", phone: "+91 98765 43210", address: "123, Tower A, Prahladnagar, Ahmedabad - 380015", isDefault: true },
  { id: 2, type: "Work", name: "John Doe", phone: "+91 98765 43210", address: "456, Business Park, SG Highway, Ahmedabad - 380054", isDefault: false },
];

const orderItems = [
  { id: 1, name: "Fresh Tomatoes", price: 40, quantity: 2, unit: "kg" },
  { id: 3, name: "Fresh Milk", price: 60, quantity: 1, unit: "L" },
  { id: 5, name: "Fresh Bananas", price: 50, quantity: 2, unit: "dozen" },
];

const paymentMethods = [
  { id: "upi", name: "UPI", icon: Smartphone, description: "Pay using any UPI app" },
  { id: "card", name: "Credit/Debit Card", icon: CreditCard, description: "Visa, Mastercard, RuPay" },
  { id: "netbanking", name: "Net Banking", icon: Building2, description: "All major banks" },
  { id: "cod", name: "Cash on Delivery", icon: Wallet, description: "Pay when you receive" },
];

const Checkout = () => {
  const [selectedAddress, setSelectedAddress] = useState(savedAddresses[0].id);
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [isLoading, setIsLoading] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = subtotal > 500 ? 0 : 30;
  const total = subtotal + deliveryCharge;

  const handlePlaceOrder = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Order placed successfully!",
        description: "You will receive a confirmation shortly",
      });
      navigate("/order-confirmation/ORD123456");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/cart" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Cart</span>
            </Link>
            <h1 className="font-display text-lg font-semibold">Checkout</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Delivery Address
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddAddress(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add New
                </Button>
              </div>

              <RadioGroup
                value={String(selectedAddress)}
                onValueChange={(value) => setSelectedAddress(Number(value))}
                className="space-y-3"
              >
                {savedAddresses.map((addr) => (
                  <div key={addr.id}>
                    <label
                      htmlFor={`addr-${addr.id}`}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddress === addr.id
                          ? "border-primary bg-accent/50"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={String(addr.id)} id={`addr-${addr.id}`} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{addr.type}</span>
                          {addr.isDefault && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {addr.name} • {addr.phone}
                        </p>
                        <p className="text-sm">{addr.address}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </RadioGroup>

              {/* Add Address Form */}
              {showAddAddress && (
                <div className="mt-4 p-4 border border-border rounded-xl bg-muted/30">
                  <h3 className="font-medium mb-4">Add New Address</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input placeholder="+91 98765 43210" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Address</Label>
                      <Input placeholder="House/Flat No., Building, Street..." />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input placeholder="Ahmedabad" />
                    </div>
                    <div className="space-y-2">
                      <Label>Pincode</Label>
                      <Input placeholder="380015" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={() => setShowAddAddress(false)}>
                      Cancel
                    </Button>
                    <Button variant="default" onClick={() => setShowAddAddress(false)}>
                      Save Address
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Method
              </h2>

              <RadioGroup
                value={selectedPayment}
                onValueChange={setSelectedPayment}
                className="space-y-3"
              >
                {paymentMethods.map((method) => (
                  <div key={method.id}>
                    <label
                      htmlFor={`pay-${method.id}`}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedPayment === method.id
                          ? "border-primary bg-accent/50"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={method.id} id={`pay-${method.id}`} />
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <method.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </RadioGroup>

              {/* UPI Input */}
              {selectedPayment === "upi" && (
                <div className="mt-4 p-4 bg-muted/30 rounded-xl">
                  <Label>Enter UPI ID</Label>
                  <Input placeholder="yourname@upi" className="mt-2" />
                </div>
              )}
            </Card>
          </div>

          {/* Order Summary - Desktop */}
          <div className="hidden lg:block">
            <Card className="p-6 sticky top-24">
              <h2 className="font-display text-lg font-semibold mb-4">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-3 mb-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} x {item.quantity}
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={deliveryCharge === 0 ? "text-success" : ""}>
                    {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between font-display text-lg font-bold">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full mt-6"
                onClick={handlePlaceOrder}
                disabled={isLoading}
              >
                {isLoading ? "Placing Order..." : `Pay ₹${total}`}
              </Button>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Secure Payment</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 glass-strong border-t border-border p-4 lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="font-display text-xl font-bold">₹{total}</p>
          </div>
          <Button
            variant="hero"
            size="lg"
            onClick={handlePlaceOrder}
            disabled={isLoading}
          >
            {isLoading ? "Placing..." : "Place Order"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
