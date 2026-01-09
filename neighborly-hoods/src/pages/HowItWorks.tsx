import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, Truck, Star, MapPin, Clock, Shield, CreditCard } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: MapPin,
      title: "Set Your Location",
      description: "Enter your address or allow location access to find shops near you.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Search,
      title: "Browse & Discover",
      description: "Explore local shops, browse products, and read reviews from your neighbors.",
      color: "from-orange-500 to-amber-500"
    },
    {
      icon: ShoppingCart,
      title: "Add to Cart",
      description: "Select your items, customize quantities, and add them to your cart.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: CreditCard,
      title: "Secure Checkout",
      description: "Pay securely with multiple payment options including COD.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Get your order delivered to your doorstep by local delivery partners.",
      color: "from-red-500 to-orange-500"
    },
    {
      icon: Star,
      title: "Rate & Review",
      description: "Share your experience and help others discover great local shops.",
      color: "from-yellow-500 to-amber-500"
    }
  ];

  const features = [
    { icon: Clock, title: "Quick Delivery", desc: "Most orders delivered within 30-60 minutes" },
    { icon: Shield, title: "Secure Payments", desc: "Your transactions are protected" },
    { icon: MapPin, title: "Local Focus", desc: "Support businesses in your neighborhood" },
    { icon: Star, title: "Quality Assured", desc: "Verified shops and genuine products" }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-accent/10">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">How LOS Works</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Shopping from local stores has never been easier. Follow these simple steps to get started.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative group">
                  <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}>
                        <step.icon className="w-6 h-6" />
                      </div>
                      <span className="text-4xl font-bold text-muted-foreground/20">{index + 1}</span>
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold text-center mb-12">Why Choose LOS?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
            <p className="text-muted-foreground mb-8">Join thousands of happy customers in your neighborhood.</p>
            <div className="flex gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/browse">Browse Shops</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
