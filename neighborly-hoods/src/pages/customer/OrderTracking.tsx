import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Check, Package, Home, Loader2, Star, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import orderService, { Order } from "@/services/orderService";
import shopService from "@/services/shopService";
import { useToast } from "@/hooks/use-toast";

const OrderTracking = () => {
  const { orderId } = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    if (orderId) fetchOrder();
  }, [orderId, isAuthenticated, authLoading]);

  const fetchOrder = async () => {
    try {
      const data = await orderService.getOrder(Number(orderId));
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast({ title: "Error", description: "Failed to load order details", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      await orderService.cancelOrder(order.id);
      toast({ title: "Order Cancelled", description: "Your order has been cancelled" });
      setShowCancelDialog(false);
      fetchOrder();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to cancel order", variant: "destructive" });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!order || !reviewComment.trim()) {
      toast({ title: "Error", description: "Please write a review", variant: "destructive" });
      return;
    }
    setIsSubmittingReview(true);
    try {
      await shopService.createReview({
        shop: order.shop,
        rating: reviewRating,
        comment: reviewComment,
      });
      toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
      setShowReviewDialog(false);
      setReviewComment("");
      setReviewRating(5);
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to submit review", variant: "destructive" });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready_for_pickup: 'bg-cyan-100 text-cyan-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getOrderSteps = () => {
    const steps = [
      { id: 'pending', title: 'Order Placed', icon: Package },
      { id: 'confirmed', title: 'Confirmed', icon: Check },
      { id: 'preparing', title: 'Preparing', icon: Package },
      { id: 'out_for_delivery', title: 'Out for Delivery', icon: Package },
      { id: 'delivered', title: 'Delivered', icon: Home },
    ];
    
    if (!order) return steps.map(s => ({ ...s, completed: false, current: false }));
    
    const statusOrder = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index < currentIndex,
      current: statusOrder[index] === order.status,
    }));
  };

  const canCancelOrder = order && ['pending', 'confirmed'].includes(order.status);
  const canReview = order && order.status === 'delivered';

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Package className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Order not found</h2>
        <Button asChild><Link to="/customer/orders">View All Orders</Link></Button>
      </div>
    );
  }

  const orderSteps = getOrderSteps();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/customer/orders" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Orders</span>
            </Link>
            <h1 className="font-display text-lg font-semibold">Order #{order.order_number}</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Status Badge */}
        <div className="text-center mb-6">
          <Badge className={`${getStatusColor(order.status)} text-sm px-4 py-1`}>
            {order.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Order Progress */}
        {order.status !== 'cancelled' && (
          <Card className="p-6 mb-6">
            <h2 className="font-semibold mb-4">Order Progress</h2>
            <div className="flex justify-between">
              {orderSteps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    step.completed ? 'bg-green-500 text-white' : 
                    step.current ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs text-center ${step.completed || step.current ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                  {index < orderSteps.length - 1 && (
                    <div className={`h-0.5 w-full mt-5 absolute ${step.completed ? 'bg-green-500' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Order Details */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4">Order Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shop</span>
              <span className="font-medium">{order.shop_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Date</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="capitalize">{order.payment_method.replace('_', ' ')}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Items */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4">Items ({order.items?.length || 0})</h2>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity} × ₹{item.unit_price}</p>
                </div>
                <span className="font-semibold">₹{item.subtotal}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Delivery Address */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4">Delivery Address</h2>
          <p className="text-muted-foreground">{order.delivery_address}</p>
          <p className="text-sm text-muted-foreground mt-2">Phone: {order.delivery_phone}</p>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          {canCancelOrder && (
            <Button variant="destructive" className="flex-1" onClick={() => setShowCancelDialog(true)}>
              Cancel Order
            </Button>
          )}
          {canReview && (
            <Button variant="outline" className="flex-1" onClick={() => setShowReviewDialog(true)}>
              <MessageSquare className="w-4 h-4 mr-2" />Leave Review
            </Button>
          )}
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>Are you sure you want to cancel this order? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Keep Order</Button>
            <Button variant="destructive" onClick={handleCancelOrder} disabled={isCancelling}>
              {isCancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>Share your experience with {order?.shop_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setReviewRating(star)} className="p-1">
                    <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="review">Your Review</Label>
              <Textarea id="review" placeholder="Tell us about your experience..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} className="mt-2" rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitReview} disabled={isSubmittingReview}>
              {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderTracking;
