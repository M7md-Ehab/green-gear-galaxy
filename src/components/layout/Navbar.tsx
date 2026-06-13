import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useAdmin } from '@/hooks/use-admin';
import CurrencySelector from '@/components/CurrencySelector';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { items, itemsCount } = useCart();
  const cartCount = itemsCount();

  return (
    <nav className="py-4 border-b border-border/40">
      <div className="container-custom flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold bg-clip-text bg-gradient-to-r from-white to-brand-green text-white">Vlitrix</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="font-medium hover:text-brand-green transition-colors">{t('home')}</Link>
          <Link to="/products" className="font-medium hover:text-brand-green transition-colors">{t('products')}</Link>
          
          <Link to="/about" className="font-medium hover:text-brand-green transition-colors">{t('about')}</Link>
          <Link to="/contact" className="font-medium hover:text-brand-green transition-colors">{t('contact')}</Link>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <CurrencySelector />
          <LanguageSelector />
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-green text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
          
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="icon" className="text-amber-400 hover:text-amber-300">
                    <Shield className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => signOut()}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button className="bg-brand-green hover:bg-brand-green/90 text-black">
                Log In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Navigation Button */}
        <div className="md:hidden flex items-center">
          <Link to="/cart" className="relative mr-4">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-green text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 z-50 bg-background border-b border-border/40 animate-fade-in">
          <div className="container-custom py-4 flex flex-col space-y-4">
            <Link to="/" className="font-medium hover:text-brand-green transition-colors" onClick={() => setIsOpen(false)}>{t('home')}</Link>
            <Link to="/products" className="font-medium hover:text-brand-green transition-colors" onClick={() => setIsOpen(false)}>{t('products')}</Link>
            
            <Link to="/about" className="font-medium hover:text-brand-green transition-colors" onClick={() => setIsOpen(false)}>{t('about')}</Link>
            <Link to="/contact" className="font-medium hover:text-brand-green transition-colors" onClick={() => setIsOpen(false)}>{t('contact')}</Link>

            <div className="flex items-center gap-2 pt-2 border-t border-border/40">
              <CurrencySelector />
              <LanguageSelector />
            </div>


            
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                <Link to="/dashboard" className="font-medium hover:text-brand-green transition-colors" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                <Button 
                  variant="ghost" 
                  className="justify-start p-0 h-auto font-medium hover:text-brand-green"
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                >
                  Log Out
                </Button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-brand-green hover:bg-brand-green/90 text-black">
                  Log In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
