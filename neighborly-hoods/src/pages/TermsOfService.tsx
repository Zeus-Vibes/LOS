import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Store, ArrowLeft } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">LOS</span>
            </Link>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          <p className="text-muted-foreground mb-6">Last updated: January 2026</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">By accessing and using LOS (Local Online Shops), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground">LOS is a local marketplace platform that connects customers with local shopkeepers. We provide a platform for:</p>
              <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
                <li>Customers to browse and purchase products from local shops</li>
                <li>Shopkeepers to list and sell their products</li>
                <li>Facilitating local commerce and delivery</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
              <p className="text-muted-foreground">To use certain features of our service, you must register for an account. You agree to:</p>
              <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Orders and Payments</h2>
              <p className="text-muted-foreground">When placing orders through LOS:</p>
              <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
                <li>All prices are in Indian Rupees (₹)</li>
                <li>Payment methods include Cash on Delivery (COD) and UPI</li>
                <li>Orders can be cancelled before preparation begins</li>
                <li>Refunds are processed according to our refund policy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Shopkeeper Responsibilities</h2>
              <p className="text-muted-foreground">Shopkeepers using our platform agree to:</p>
              <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
                <li>Provide accurate product information and pricing</li>
                <li>Maintain product quality and freshness</li>
                <li>Process orders in a timely manner</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Limitation of Liability</h2>
              <p className="text-muted-foreground">LOS acts as an intermediary platform. We are not responsible for:</p>
              <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
                <li>Product quality issues (handled by shopkeepers)</li>
                <li>Delivery delays beyond our control</li>
                <li>Disputes between customers and shopkeepers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Contact Us</h2>
              <p className="text-muted-foreground">If you have any questions about these Terms, please contact us at support@los.local</p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
