import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Check, Circle, Package, Truck, Home, 
  MapPin, Phone, FileText, Store
} from "lucide-react";

const orderSteps = [
  { id: 1, title: "Order Placed", time: "Today, 2:30 PM", completed: true },
  { id: 2, title: "Order Confirmed", time: "Today, 2:32 PM", completed: true },
  { id: 3, title: "Preparing Order", time: "Today, 2:45 PM", completed: true, current: true },
  { id: 4, title: "Out for Delivery", time: "Estimated: 4:00 PM", completed: false },
  { id: 5, title: "Delivered", time: "Estimated: 4:30 PM", completed: false },
];

const orderItems = [
  { id: 1, name: "Fresh Tomatoes", quantity: 2, unit: "kg", price: 80, image: "https://images.unsplash.com/photo-1546470427-f5c7f9f9f9f9?w=80&h=80&fit=crop" },
  { id: 2, name: "Fresh Milk", quantity: 1, unit: "L", price: 60, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=80&h=80&fit=crop" },
  { id: 3, name: "Fresh Bananas", quantity: 2, unit: "dozen", price: 100, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=80&h=80&fit=crop" },
];

const OrderTracking = () => {
  const { orderId } = useParams();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/orders" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">My Orders</span>
            </Link>
            <h1 className="font-display text-lg font-semibold">Order #{orderId}</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Badge variant="pending" className="mb-2">Preparing</Badge>
                  <h2 className="font-display text-xl font-semibold">Your order is being prepared</h2>
                  <p className="text-sm text-muted-foreground">Estimated delivery: Today, 4:00 PM - 4:30 PM</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
                  <Package className="w-8 h-8 text-warning animate-bounce-soft" />
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                {orderSteps.map((step, index) => (
                  <div key={step.id} className="flex gap-4 pb-6 last:pb-0">
                    {/* Line & Dot */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed
                          ? "bg-success text-success-foreground"
                          : step.current
                          ? "bg-warning text-warning-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {step.completed && !step.current ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Circle className="w-3 h-3 fill-current" />
                        )}
                      </div>
                      {index < orderSteps.length - 1 && (
                        <div className={`w-0.5 flex-1 min-h-[40px] ${
                          step.completed ? "bg-success" : "bg-muted"
                        }`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pb-4">
                      <p className={`font-medium ${
                        step.current ? "text-foreground" : step.completed ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Map Placeholder */}
            <Card className="overflow-hidden">
              <div className="h-48 bg-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Truck className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Live tracking will appear here</p>
                </div>
              </div>
            </Card>

            {/* Order Items */}
            <Card className="p-6">
              <h3 className="font-display font-semibold mb-4">Order Items</h3>
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                    <p className="font-medium">₹{item.price}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Shop Contact */}
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                  <Store className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Fresh Mart</p>
                  <p className="text-sm text-muted-foreground">0.5 km away</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href="tel:+919876543210">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Shop
                </a>
              </Button>
            </Card>

            {/* Delivery Address */}
            <Card className="p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Home className="w-4 h-4 text-primary" />
                Delivery Address
              </h3>
              <p className="text-sm">John Doe</p>
              <p className="text-sm text-muted-foreground">
                123, Tower A, Prahladnagar, Ahmedabad - 380015
              </p>
              <p className="text-sm text-muted-foreground">+91 98765 43210</p>
            </Card>

            {/* Payment Info */}
            <Card className="p-4">
              <h3 className="font-medium mb-3">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹240</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-success">FREE</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>₹240</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-xs mt-2">
                  Paid via UPI
                </p>
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Download Invoice
              </Button>
              <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                Cancel Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
