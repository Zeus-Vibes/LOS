import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Store, TrendingUp, Users, Package, BarChart3, Clock, Shield, Headphones, CheckCircle } from "lucide-react";

const ForShopkeepers = () => {
  const benefits = [
    {
      icon: Users,
      title: "Reach More Customers",
      description: "Get discovered by thousands of customers in your neighborhood looking for local products."
    },
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description: "Increase sales with online presence and reach customers who prefer digital shopping."
    },
    {
      icon: Package,
      title: "Easy Inventory Management",
      description: "Manage your products, prices, and stock levels from a simple dashboard."
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Track your sales, popular products, and customer behavior with detailed reports."
    },
    {
      icon: Clock,
      title: "Flexible Hours",
      description: "Set your own operating hours and manage orders at your convenience."
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Receive payments directly to your account with our secure payment system."
    }
  ];

  const steps = [
    { step: 1, title: "Register Your Shop", desc: "Fill out a simple form with your business details" },
    { step: 2, title: "Get Verified", desc: "Our team verifies your business within 24-48 hours" },
    { step: 3, title: "Add Products", desc: "Upload your products with photos and prices" },
    { step: 4, title: "Start Selling", desc: "Receive orders and grow your business" }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-orange-500/10 via-background to-amber-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
                <Store className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-600">For Business Owners</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Bring Your Shop <span className="text-orange-500">Online</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Join LOS and connect with customers in your neighborhood. No technical skills required - we make it easy for you to sell online.
              </p>
              <div className="flex gap-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/register-shop">Register Your Shop</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/login">Already Registered? Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold mb-4">Why Sell on LOS?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to take your local business online and reach more customers.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Join */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold mb-4">How to Get Started</h2>
              <p className="text-muted-foreground">Join LOS in 4 simple steps</p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-4 gap-6">
                {steps.map((item, index) => (
                  <div key={index} className="text-center relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">
                      {item.step}
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-orange-500/50 to-transparent" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features List */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl font-bold mb-6">Everything You Need to Succeed</h2>
                <div className="space-y-4">
                  {[
                    "Free shop registration",
                    "Easy-to-use dashboard",
                    "Real-time order notifications",
                    "Customer reviews & ratings",
                    "Sales analytics & reports",
                    "Dedicated support team",
                    "Marketing tools & promotions",
                    "Secure payment processing"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-3xl p-8 border border-orange-500/20">
                <div className="text-center">
                  <Headphones className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-display text-2xl font-bold mb-2">Need Help?</h3>
                  <p className="text-muted-foreground mb-6">Our support team is here to help you get started and grow your business.</p>
                  <Button variant="outline" asChild>
                    <Link to="/contact">Contact Support</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-orange-500 to-amber-500">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Grow Your Business?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of local shopkeepers who are already selling on LOS. Registration is free!
            </p>
            <Button size="lg" className="bg-white text-orange-600 hover:bg-white/90" asChild>
              <Link to="/register-shop">Register Your Shop Now</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ForShopkeepers;
