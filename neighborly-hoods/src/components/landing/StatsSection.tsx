import { useEffect, useState } from "react";
import { Store, Users, Package, MapPin } from "lucide-react";

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
}

const StatItem = ({ icon, value, suffix, label }: StatItemProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-center group">
      <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="font-display text-4xl md:text-5xl font-bold mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
};

const StatsSection = () => {
  const stats = [
    {
      icon: <Store className="w-7 h-7 text-primary" />,
      value: 2500,
      suffix: "+",
      label: "Local Shops"
    },
    {
      icon: <Users className="w-7 h-7 text-primary" />,
      value: 50000,
      suffix: "+",
      label: "Happy Customers"
    },
    {
      icon: <Package className="w-7 h-7 text-primary" />,
      value: 100000,
      suffix: "+",
      label: "Products Listed"
    },
    {
      icon: <MapPin className="w-7 h-7 text-primary" />,
      value: 25,
      suffix: "+",
      label: "Cities Covered"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-foreground to-foreground/90 text-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
