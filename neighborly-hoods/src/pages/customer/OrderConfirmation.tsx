import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Package, ArrowRight, Home } from "lucide-react";

const OrderConfirmation = () => {
  const { orderId } = useParams();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Success Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full gradient-primary mx-auto flex items-center justify-center animate-scale-in">
            <CheckCircle2 className="w-12 h-12 text-primary-foreground" />
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-primary/20 animate-ping" />
        </div>

        <h1 className="font-display text-3xl font-bold mb-2 animate-fade-up">
          Order Placed!
        </h1>
        <p className="text-muted-foreground mb-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
          Thank you for your order. We'll notify you when it's on the way.
        </p>

        {/* Order ID */}
        <Card className="p-6 mb-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <p className="text-sm text-muted-foreground mb-1">Order ID</p>
          <p className="font-display text-2xl font-bold text-primary">{orderId}</p>
          
          <div className="border-t border-border mt-4 pt-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Package className="w-4 h-4" />
              <span>Estimated delivery: Today, 4:00 PM - 5:00 PM</span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: "300ms" }}>
          <Button variant="hero" size="lg" className="w-full" asChild>
            <Link to={`/order/${orderId}`}>
              Track Order
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full" asChild>
            <Link to="/browse">
              <Home className="w-5 h-5 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        {/* Order Summary Preview */}
        <Card className="p-4 mt-8 text-left animate-fade-up" style={{ animationDelay: "400ms" }}>
          <h3 className="font-medium mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fresh Tomatoes x 2</span>
              <span>₹80</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fresh Milk x 1</span>
              <span>₹60</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fresh Bananas x 2</span>
              <span>₹100</span>
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span>Total Paid</span>
                <span>₹240</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OrderConfirmation;
