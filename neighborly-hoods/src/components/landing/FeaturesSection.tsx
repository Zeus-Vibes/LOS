import { Store, Truck, ShieldCheck, Star, MapPin, Clock, Users, TrendingUp } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: string;
}

const FeatureCard = ({ icon, title, description, delay = "0ms" }: FeatureCardProps) => (
  <div 
    className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-up opacity-0"
    style={{ animationDelay: delay, animationFillMode: "forwards" }}
  >
    <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </div>
);

const FeaturesSection = () => {
  const customerFeatures = [
    {
      icon: <Store className="w-6 h-6 text-primary" />,
      title: "Discover Local Shops",
      description: "Find trusted neighborhood stores with verified products and genuine reviews from your community."
    },
    {
      icon: <Truck className="w-6 h-6 text-primary" />,
      title: "Fast Local Delivery",
      description: "Get your orders delivered quickly from shops just around the corner. Same-day delivery available."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      title: "Secure Payments",
      description: "Multiple payment options including UPI, cards, and cash on delivery. All transactions are protected."
    },
    {
      icon: <Star className="w-6 h-6 text-primary" />,
      title: "Verified Reviews",
      description: "Real reviews from real customers help you make informed decisions about products and shops."
    }
  ];

  const shopkeeperFeatures = [
    {
      icon: <MapPin className="w-6 h-6 text-primary" />,
      title: "Reach Local Customers",
      description: "Connect with customers in your neighborhood actively looking for products you sell."
    },
    {
      icon: <Clock className="w-6 h-6 text-primary" />,
      title: "Easy Order Management",
      description: "Simple dashboard to manage orders, track deliveries, and update your inventory in real-time."
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Build Customer Loyalty",
      description: "Create lasting relationships with repeat customers through excellent service and quality."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-primary" />,
      title: "Grow Your Business",
      description: "Access insights and analytics to understand your customers and grow your sales."
    }
  ];

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* For Customers */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
              For Customers
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Why Shop Local with LOS?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the convenience of online shopping while supporting businesses in your neighborhood.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {customerFeatures.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={`${index * 100}ms`}
              />
            ))}
          </div>
        </div>

        {/* For Shopkeepers */}
        <div>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              For Shopkeepers
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Grow Your Business Online
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of local shopkeepers who are expanding their reach with LOS.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {shopkeeperFeatures.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={`${(index + 4) * 100}ms`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
