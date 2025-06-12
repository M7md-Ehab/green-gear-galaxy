import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-firebase-auth';
import CurrencySelector from '@/components/CurrencySelector';
import LanguageSelector from '@/components/LanguageSelector';
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const {
    items,
    itemsCount
  } = useCart();
  const {
    isLoggedIn
  } = useAuth();
  const cartCount = itemsCount();
  return <nav className="py-4 border-b border-border/40">
      <div className="container-custom flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold bg-clip-text bg-gradient-to-r from-white to-brand-green text-white">Vlitrix</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="font-medium hover:text-brand-green transition-colors">Home</Link>
          <Link to="/products" className="font-medium hover:text-brand-green transition-colors">Products</Link>
          <Link to="/about" className="font-medium hover:text-brand-green transition-colors">About</Link>
          <Link to="/contact" className="font-medium hover:text-brand-green transition-colors">Contact</Link>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <CurrencySelector />
          <LanguageSelector />
          {isLoggedIn ? <Link to="/dashboard" aria-label="Profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link> : <Link to="/auth" aria-label="Sign in / Log in">
              <Button variant="ghost" className="flex items-center gap-1">
                <User className="h-5 w-5" />
                <span className="ml-1">Sign in</span>
              </Button>
            </Link>}
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-brand-green text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>}
            </Button>
          </Link>
        </div>

        {/* Mobile Navigation Button */}
        <div className="md:hidden flex items-center">
          <Link to="/cart" className="relative mr-4">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-brand-green text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>}
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && <div className="md:hidden absolute top-16 inset-x-0 z-50 bg-background border-b border-border/40 animate-fade-in">
          <div className="container-custom py-4 flex flex-col space-y-4">
            <Link to="/" className="font-medium hover:text-brand-green transition-colors" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/products" className="font-medium hover:text-brand-green transition-colors" onClick={() => setIsOpen(false)}>Products</Link>
            <Link to="/about" className="font-medium hover:text-brand-green transition-colors" onClick={() => setIsOpen(false)}>About</Link>
            <Link to="/contact" className="font-medium hover:text-brand-green transition-colors" onClick={() => setIsOpen(false)}>Contact</Link>
            {isLoggedIn ? <Link to="/dashboard" className="font-medium hover:text-brand-green transition-colors" onClick={() => setIsOpen(false)}>Dashboard</Link> : <Link to="/auth" className="font-medium hover:text-brand-green transition-colors" onClick={() => setIsOpen(false)}>Sign in / Log in</Link>}
          </div>
        </div>}
    </nav>;
};
export default Navbar;