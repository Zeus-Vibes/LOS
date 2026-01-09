import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Store, Menu, X, LogOut, LayoutDashboard, ShoppingBag, Settings } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.user_type) {
      case 'admin': return '/admin';
      case 'shopkeeper': return '/shopkeeper/dashboard';
      case 'customer': return '/customer/dashboard';
      default: return '/browse';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              LOS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/browse" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Browse Shops
            </Link>
            <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              How It Works
            </Link>
            <Link to="/for-shopkeepers" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              For Shopkeepers
            </Link>
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-sm font-medium">
                      {user.first_name?.[0] || user.username?.[0] || 'U'}
                    </div>
                    <span className="text-sm font-medium">{user.first_name || user.username}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.first_name} {user.last_name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{user.user_type}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardLink()} className="cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {user.user_type === 'customer' && (
                    <DropdownMenuItem asChild>
                      <Link to="/customer/orders" className="cursor-pointer">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              <Link to="/browse" className="px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Browse Shops
              </Link>
              <Link to="/how-it-works" className="px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                How It Works
              </Link>
              <Link to="/for-shopkeepers" className="px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                For Shopkeepers
              </Link>
              <div className="border-t border-border mt-2 pt-4 flex flex-col gap-2">
                {isAuthenticated && user ? (
                  <>
                    <div className="px-4 py-2 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-sm font-medium">
                        {user.first_name?.[0] || user.username?.[0] || 'U'}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{user.first_name || user.username}</div>
                        <div className="text-xs text-muted-foreground capitalize">{user.user_type}</div>
                      </div>
                    </div>
                    <Link to={getDashboardLink()} className="px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                      Dashboard
                    </Link>
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm font-medium text-left text-destructive">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                    </Button>
                    <Button variant="hero" asChild>
                      <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
