import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-illustration.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-12 md:py-20 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-border mb-6 animate-fade-up">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Your neighborhood, now online</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
              Discover Local Shops in{" "}
              <span className="gradient-text">Your Neighborhood</span>
            </h1>
            
            <p className="text-muted-foreground text-lg md:text-xl mb-8 animate-fade-up" style={{ animationDelay: "200ms" }}>
              Connect with trusted local businesses, browse thousands of products, and get fast doorstep delivery. Support your community while enjoying the convenience of online shopping.
            </p>
            
            {/* Location selector */}
            <div className="flex items-center gap-2 mb-8 animate-fade-up" style={{ animationDelay: "300ms" }}>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Ahmedabad, Gujarat</span>
              </div>
              <button className="text-primary text-sm font-medium hover:underline">
                Change Location
              </button>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "400ms" }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/browse">
                  Browse Shops
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/register-shop">
                  Register Your Shop
                </Link>
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center gap-6 mt-10 pt-10 border-t border-border animate-fade-up" style={{ animationDelay: "500ms" }}>
              <div className="text-center">
                <div className="font-display text-2xl font-bold">2500+</div>
                <div className="text-muted-foreground text-sm">Local Shops</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="font-display text-2xl font-bold">50K+</div>
                <div className="text-muted-foreground text-sm">Happy Customers</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="font-display text-2xl font-bold">4.8★</div>
                <div className="text-muted-foreground text-sm">Average Rating</div>
              </div>
            </div>
          </div>
          
          {/* Right - Hero Image */}
          <div className="relative lg:block animate-fade-up" style={{ animationDelay: "300ms" }}>
            <div className="relative">
              <img
                src={heroImage}
                alt="Local shops and delivery illustration"
                className="w-full h-auto rounded-3xl shadow-2xl"
              />
              {/* Floating cards */}
              <div className="absolute -left-4 top-1/4 glass-strong rounded-xl p-4 shadow-lg animate-bounce-soft">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <span className="text-success text-lg">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Order Delivered!</div>
                    <div className="text-muted-foreground text-xs">Just now</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-4 bottom-1/4 glass-strong rounded-xl p-4 shadow-lg animate-bounce-soft" style={{ animationDelay: "500ms" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-lg">🏪</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">New Shop Added</div>
                    <div className="text-muted-foreground text-xs">Fresh Mart - 0.5km</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
