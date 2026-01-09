import { Link } from "react-router-dom";
import { Store, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">LOS</span>
            </Link>
            <p className="text-background/70 text-sm mb-6">
              Connecting your neighborhood. Shop local, support local, grow together.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* For Customers */}
          <div>
            <h4 className="font-display font-semibold mb-4">For Customers</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li><Link to="/browse" className="hover:text-background transition-colors">Browse Shops</Link></li>
              <li><Link to="/how-it-works" className="hover:text-background transition-colors">How It Works</Link></li>
              <li><Link to="/orders" className="hover:text-background transition-colors">Track Orders</Link></li>
              <li><Link to="/help" className="hover:text-background transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* For Shopkeepers */}
          <div>
            <h4 className="font-display font-semibold mb-4">For Shopkeepers</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li><Link to="/register-shop" className="hover:text-background transition-colors">Register Your Shop</Link></li>
              <li><Link to="/shopkeeper/dashboard" className="hover:text-background transition-colors">Seller Dashboard</Link></li>
              <li><Link to="/pricing" className="hover:text-background transition-colors">Pricing</Link></li>
              <li><Link to="/seller-guide" className="hover:text-background transition-colors">Seller Guide</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li><Link to="/about" className="hover:text-background transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-background transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-background transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-background transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 text-center text-sm text-background/50">
          <p>© {new Date().getFullYear()} LOS - Local Online Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
