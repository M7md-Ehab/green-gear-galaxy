
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail, X } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-border/40 pt-12 pb-6">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Brand & Social */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-brand-green">Mehab</h3>
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
              <a href="https://tiktok.com" className="text-gray-400 hover:text-brand-green transition-colors">
                <X className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" className="text-gray-400 hover:text-brand-green transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="mailto:mohamed.ehab.work0@gmail.com" className="text-gray-400 hover:text-brand-green transition-colors">
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
                <Link to="/products?series=T Series" className="text-sm text-gray-400 hover:text-brand-green transition-colors">T Series</Link>
              </li>
              <li>
                <Link to="/products?series=S Series" className="text-sm text-gray-400 hover:text-brand-green transition-colors">S Series</Link>
              </li>
              <li>
                <Link to="/products?series=X Series" className="text-sm text-gray-400 hover:text-brand-green transition-colors">X Series</Link>
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
            © {new Date().getFullYear()} Mehab. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
