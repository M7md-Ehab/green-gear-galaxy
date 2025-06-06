import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail, X } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-border/40 pt-12 pb-6">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Brand & Social */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-brand-green">Vlitrix</h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Premium machines with cutting-edge technology and exceptional performance.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-gray-400 hover:text-brand-green transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-brand-green transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-brand-green transition-colors">
                <X className="h-5 w-5" />
              </a>
              <a href="https://tiktok.com" className="text-gray-400 hover:text-brand-green transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a href="https://linkedin.com" className="text-gray-400 hover:text-brand-green transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="mailto:info@vlitrix.com" className="text-gray-400 hover:text-brand-green transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Products</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-sm text-gray-400 hover:text-brand-green transition-colors">All Products</Link>
              </li>
              <li>
                <Link to="/products?series=T1" className="text-sm text-gray-400 hover:text-brand-green transition-colors">T1 Series</Link>
              </li>
              <li>
                <Link to="/products?series=S1" className="text-sm text-gray-400 hover:text-brand-green transition-colors">S1 Series</Link>
              </li>
              <li>
                <Link to="/products?series=X1" className="text-sm text-gray-400 hover:text-brand-green transition-colors">X1 Series</Link>
              </li>
              <li>
                <Link to="/products?series=K1" className="text-sm text-gray-400 hover:text-brand-green transition-colors">K1 Series</Link>
              </li>
              <li>
                <Link to="/products?series=N1" className="text-sm text-gray-400 hover:text-brand-green transition-colors">N1 Series</Link>
              </li>
              <li>
                <Link to="/products?series=L1" className="text-sm text-gray-400 hover:text-brand-green transition-colors">L1 Series</Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Customer Care</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/return-policy" className="text-sm text-gray-400 hover:text-brand-green transition-colors">Return Policy</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm text-gray-400 hover:text-brand-green transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="text-sm text-gray-400 hover:text-brand-green transition-colors">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-400 hover:text-brand-green transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-400 hover:text-brand-green transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Payment Partners */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Our Partners</h4>
            <div className="flex space-x-4">
              <div className="bg-white p-2 rounded-md">
                <span className="text-black font-bold text-sm">PAYMOB</span>
              </div>
              <div className="bg-white p-2 rounded-md">
                <span className="text-black font-bold text-sm">BOSTA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Vlitrix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
