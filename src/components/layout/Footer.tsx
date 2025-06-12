
import { Link, useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    navigate('/products');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="bg-black border-t border-gray-800 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-green-500">Vlitrix</h3>
            <p className="text-gray-400 mb-4">
              Leading provider of innovative gaming and vending machines for the modern entertainment industry.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-gray-400 hover:text-green-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://x.com" className="text-gray-400 hover:text-green-500 transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-green-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://tiktok.com" className="text-gray-400 hover:text-green-500 transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7.56a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.05z"/>
                </svg>
              </a>
              <a href="https://youtube.com" className="text-gray-400 hover:text-green-500 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Products</h4>
            <ul className="space-y-2">
              <li><Link to="/products?series=T" className="text-gray-400 hover:text-green-500 transition-colors">T Series</Link></li>
              <li><Link to="/products?series=S" className="text-gray-400 hover:text-green-500 transition-colors">S Series</Link></li>
              <li><Link to="/products?series=X" className="text-gray-400 hover:text-green-500 transition-colors">X Series</Link></li>
              <li><Link to="/products?series=K" className="text-gray-400 hover:text-green-500 transition-colors">K Series</Link></li>
              <li><Link to="/products?series=N" className="text-gray-400 hover:text-green-500 transition-colors">N Series</Link></li>
              <li><Link to="/products?series=L" className="text-gray-400 hover:text-green-500 transition-colors">L Series</Link></li>
              <li>
                <button 
                  onClick={scrollToTop}
                  className="text-gray-400 hover:text-green-500 transition-colors"
                >
                  Explore Products
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-green-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-green-500 transition-colors">Contact</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-400 hover:text-green-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="text-gray-400 hover:text-green-500 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/return-policy" className="text-gray-400 hover:text-green-500 transition-colors">Return Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="mailto:support@vlitrix.com" className="text-gray-400 hover:text-green-500 transition-colors">Email Support</a></li>
              <li><span className="text-gray-400">+1 (555) 123-4567</span></li>
              <li><span className="text-gray-400">Mon-Fri 9AM-6PM EST</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {currentYear} Vlitrix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
