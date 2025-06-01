
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, Clock, Zap, Cpu, Award } from 'lucide-react';

import { products } from '@/data/products';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';

const Index = () => {
  // Get featured products (claw machine and vending machine)
  const featuredProducts = [
    products.find(p => p.id === 'k1-pro'), // Claw machine
    products.find(p => p.id === 't1-pro'), // Vending machine
    products.find(p => p.id === 'l1-pro'), // Premium claw machine
  ].filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section with Asus-inspired animations */}
        <section className="relative h-screen flex items-center overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[10%] right-[15%] w-96 h-96 rounded-full bg-brand-green/10 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[20%] right-[25%] w-72 h-72 rounded-full bg-brand-green/20 blur-2xl animate-pulse delay-1000"></div>
            <div className="absolute top-[40%] right-[5%] w-48 h-48 rounded-full bg-brand-green/15 blur-xl animate-pulse delay-500"></div>
            
            {/* Floating particles */}
            <div className="absolute top-[20%] right-[40%] w-2 h-2 bg-brand-green rounded-full animate-bounce delay-300"></div>
            <div className="absolute top-[60%] right-[60%] w-3 h-3 bg-brand-green/70 rounded-full animate-bounce delay-700"></div>
            <div className="absolute top-[80%] right-[30%] w-1 h-1 bg-brand-green rounded-full animate-bounce delay-1000"></div>
            
            {/* Geometric lines */}
            <div className="absolute top-[30%] right-[10%] w-32 h-px bg-gradient-to-r from-transparent to-brand-green/50 animate-pulse"></div>
            <div className="absolute top-[70%] right-[20%] w-24 h-px bg-gradient-to-l from-transparent to-brand-green/30 animate-pulse delay-500"></div>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-transparent z-10"></div>
          
          <div className="container-custom relative z-20">
            <div className="max-w-3xl">
              <div className="animate-fade-in">
                <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                  <span className="block animate-slide-in-right">Next Generation</span>
                  <span className="block bg-clip-text text-transparent bg-gradient-to-r from-brand-green to-white animate-scale-in delay-300">
                    Gaming Machines
                  </span>
                </h1>
              </div>
              
              <div className="animate-fade-in delay-500">
                <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                  Experience unprecedented entertainment with our cutting-edge 
                  <span className="text-brand-green font-semibold"> claw machines</span> and 
                  <span className="text-brand-green font-semibold"> vending machines</span> 
                  designed for the modern arcade.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-6 animate-fade-in delay-700">
                <Link to="/products?type=claw" className="btn-primary hover-scale group">
                  <span className="group-hover:animate-pulse">Explore Claw Machines</span>
                </Link>
                <Link to="/products?type=vending" className="btn-secondary hover-scale group">
                  <span className="group-hover:animate-pulse">View Vending Machines</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with animations */}
        <section className="py-20 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
          {/* Background animation */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-green to-transparent animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-brand-green to-transparent animate-pulse delay-1000"></div>
          </div>
          
          <div className="container-custom relative z-10">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl font-bold mb-6">Why Choose Vlitrix?</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Discover the future of arcade entertainment with our innovative technology
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Truck, title: "Fast Delivery", desc: "Lightning-fast shipping with premium packaging and white-glove service.", delay: "delay-100" },
                { icon: CreditCard, title: "Secure Payment", desc: "Advanced encryption and multiple payment options for your peace of mind.", delay: "delay-200" },
                { icon: Clock, title: "24/7 Support", desc: "Round-the-clock technical assistance from our expert team.", delay: "delay-300" },
                { icon: ShieldCheck, title: "100% Secure", desc: "Military-grade security for all your personal and business data.", delay: "delay-400" }
              ].map((feature, index) => (
                <div key={index} className={`group hover-scale animate-fade-in ${feature.delay}`}>
                  <div className="flex flex-col items-center text-center p-8 rounded-xl bg-gradient-to-b from-gray-900 to-black border border-brand-green/20 hover:border-brand-green/60 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-green/20">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-brand-green/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                      <feature.icon className="h-16 w-16 text-brand-green relative z-10 group-hover:animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-brand-green transition-colors">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-20 bg-black relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute top-[20%] left-[10%] w-64 h-64 rounded-full bg-brand-green/5 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[30%] right-[15%] w-96 h-96 rounded-full bg-brand-green/10 blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="container-custom relative z-10">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl font-bold mb-6">Featured Gaming Machines</h2>
              <p className="text-gray-400 max-w-3xl mx-auto text-lg">
                Experience the perfect blend of cutting-edge technology and entertainment with our premium claw and vending machines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {featuredProducts.map((product, index) => (
                product && (
                  <div key={product.id} className={`animate-fade-in delay-${(index + 1) * 100}`}>
                    <ProductCard product={product} />
                  </div>
                )
              ))}
            </div>

            <div className="text-center mt-16 animate-fade-in delay-500">
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/products?type=claw" className="btn-secondary hover-scale">
                  View All Claw Machines
                </Link>
                <Link to="/products?type=vending" className="btn-secondary hover-scale">
                  View All Vending Machines
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-20 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
          <div className="container-custom relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="animate-fade-in">
                <h2 className="text-4xl font-bold mb-6">Powered by Innovation</h2>
                <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                  Our machines feature state-of-the-art technology including AI-powered mechanics, 
                  quantum precision systems, and holographic displays that redefine arcade entertainment.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { icon: Zap, title: "AI Powered", desc: "Smart automation" },
                    { icon: Cpu, title: "Quantum Tech", desc: "Precision control" },
                    { icon: Award, title: "Premium Quality", desc: "Award winning" }
                  ].map((tech, index) => (
                    <div key={index} className={`text-center animate-fade-in delay-${(index + 2) * 100}`}>
                      <div className="bg-brand-green/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 hover:bg-brand-green/20 transition-colors group">
                        <tech.icon className="h-8 w-8 text-brand-green group-hover:animate-pulse" />
                      </div>
                      <h4 className="font-semibold text-white mb-1">{tech.title}</h4>
                      <p className="text-sm text-gray-400">{tech.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative animate-scale-in delay-300">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-green/20 to-transparent rounded-lg blur-xl"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-black p-8 rounded-xl border border-brand-green/30">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-brand-green mb-2">99.9%</div>
                    <div className="text-gray-300">Uptime Reliability</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-black relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-green to-transparent animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-brand-green to-transparent animate-pulse delay-1000"></div>
          </div>
          
          <div className="container-custom relative z-10">
            <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border border-brand-green/30 rounded-2xl p-12 md:p-16 text-center animate-scale-in">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Arcade?</h2>
              <p className="text-gray-300 mb-10 text-xl max-w-3xl mx-auto">
                Join thousands of arcade owners who have revolutionized their entertainment spaces with our cutting-edge machines.
              </p>
              <Link to="/products" className="btn-primary text-lg px-8 py-4 hover-scale">
                Explore All Products
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
