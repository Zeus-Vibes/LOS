import { Search, ShoppingCart, Package, Store, Box, CreditCard } from "lucide-react";

interface StepProps {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Step = ({ step, icon, title, description }: StepProps) => (
  <div className="relative flex flex-col items-center text-center group">
    <div className="relative z-10">
      <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
        {icon}
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold">
        {step}
      </div>
    </div>
    <h3 className="font-display font-semibold text-lg mt-6 mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm max-w-xs">{description}</p>
  </div>
);

const HowItWorksSection = () => {
  const customerSteps = [
    {
      icon: <Search className="w-8 h-8 text-primary-foreground" />,
      title: "Browse & Discover",
      description: "Search for shops or products near you. Filter by category, distance, or ratings."
    },
    {
      icon: <ShoppingCart className="w-8 h-8 text-primary-foreground" />,
      title: "Add to Cart",
      description: "Select your favorite products from local shops and add them to your cart."
    },
    {
      icon: <Package className="w-8 h-8 text-primary-foreground" />,
      title: "Get Delivery",
      description: "Place your order and track delivery in real-time. Enjoy fast local delivery!"
    }
  ];

  const shopkeeperSteps = [
    {
      icon: <Store className="w-8 h-8 text-primary-foreground" />,
      title: "Register Your Shop",
      description: "Create your shop profile with details, location, and images. Quick approval process."
    },
    {
      icon: <Box className="w-8 h-8 text-primary-foreground" />,
      title: "Add Products",
      description: "Upload your product catalog. Add images, prices, and manage inventory easily."
    },
    {
      icon: <CreditCard className="w-8 h-8 text-primary-foreground" />,
      title: "Receive Orders",
      description: "Get notified for new orders. Manage, prepare, and deliver to your customers."
    }
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Getting started is easy. Whether you're a customer or a shopkeeper, we've made the process simple.
          </p>
        </div>

        {/* Customer Steps */}
        <div className="mb-20">
          <h3 className="text-center font-display text-xl font-semibold mb-12 text-primary">
            For Customers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            
            {customerSteps.map((step, index) => (
              <Step key={step.title} step={index + 1} {...step} />
            ))}
          </div>
        </div>

        {/* Shopkeeper Steps */}
        <div className="bg-secondary/30 rounded-3xl p-8 lg:p-12">
          <h3 className="text-center font-display text-xl font-semibold mb-12 text-primary">
            For Shopkeepers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            
            {shopkeeperSteps.map((step, index) => (
              <Step key={step.title} step={index + 1} {...step} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
