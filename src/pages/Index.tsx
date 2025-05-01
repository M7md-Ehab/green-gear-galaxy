
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, Clock } from 'lucide-react';

import { products } from '@/data/products';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';

const Index = () => {
  // Get featured products (one from each series)
  const featuredProducts = [
    products.find(p => p.id === 't1-pro'),
    products.find(p => p.id === 's1-pro'),
    products.find(p => p.id === 'x1-pro'),
  ].filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent z-10"></div>
          <div className="container-custom relative z-20">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Next Generation
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-green to-white">
                  Technology Machines
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8">
                Experience unprecedented performance and reliability with our cutting-edge machines designed for the modern world.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="btn-primary">
                  Explore Products
                </Link>
                <Link to="/about" className="btn-secondary">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
          
          {/* Abstract background animation */}
          <div className="absolute right-0 top-0 w-full h-full z-0 opacity-40">
            <div className="absolute top-[20%] right-[10%] w-72 h-72 rounded-full bg-brand-green/20 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[30%] right-[20%] w-96 h-96 rounded-full bg-brand-green/10 blur-3xl animate-pulse"></div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-black">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-black border border-brand-green/20 hover:border-brand-green/40 transition-all">
                <Truck className="h-12 w-12 text-brand-green mb-4" />
                <h3 className="text-xl font-medium mb-2">Fast Shipping</h3>
                <p className="text-gray-400">Quick and reliable delivery to your doorstep in secure packaging.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-black border border-brand-green/20 hover:border-brand-green/40 transition-all">
                <CreditCard className="h-12 w-12 text-brand-green mb-4" />
                <h3 className="text-xl font-medium mb-2">Online Payment</h3>
                <p className="text-gray-400">Secure and convenient payment options through Paymob.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-black border border-brand-green/20 hover:border-brand-green/40 transition-all">
                <Clock className="h-12 w-12 text-brand-green mb-4" />
                <h3 className="text-xl font-medium mb-2">24/7 Support</h3>
                <p className="text-gray-400">Our team is always ready to assist you whenever you need help.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-black border border-brand-green/20 hover:border-brand-green/40 transition-all">
                <ShieldCheck className="h-12 w-12 text-brand-green mb-4" />
                <h3 className="text-xl font-medium mb-2">100% Safe</h3>
                <p className="text-gray-400">Guaranteed security for your personal information and transactions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16 bg-gradient-to-b from-black to-gray-900">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Discover our most popular machines known for their exceptional performance and reliability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                product && <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/products" className="btn-secondary">
                View All Products
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-black">
          <div className="container-custom">
            <div className="bg-gradient-to-r from-gray-900 to-black border border-brand-green/20 rounded-lg p-8 md:p-12">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Experience the Future?</h2>
                <p className="text-gray-300 mb-8">
                  Join thousands of satisfied customers who have transformed their workflow with our machines.
                </p>
                <Link to="/products" className="btn-primary">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
