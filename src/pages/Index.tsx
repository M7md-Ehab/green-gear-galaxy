
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, Clock, Zap, Cpu, Award } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

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

  // Animation hooks
  const { ref: heroRef, inView: heroInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: featuresRef, inView: featuresInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: productsRef, inView: productsInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: techRef, inView: techInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: ctaRef, inView: ctaInView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const handleExploreAllProducts = () => {
    window.location.href = '/products';
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section ref={heroRef} className="relative h-screen flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-transparent z-10"></div>
          
          <div className="container-custom relative z-20">
            <div className={`max-w-3xl transition-all duration-1000 ${heroInView ? 'opacity-100' : 'opacity-0'}`}>
              <div>
                <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                  <span className="block">Next Generation</span>
                  <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white to-brand-green">
                    Gaming Machines
                  </span>
                </h1>
              </div>
              
              <div>
                <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                  Experience unprecedented entertainment with our cutting-edge 
                  <span className="text-brand-green font-semibold"> claw machines</span> and 
                  <span className="text-brand-green font-semibold"> vending machines </span> 
                  designed for the modern arcade.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-6">
                <Link to="/products?type=claw" className="btn-primary group">
                  <span className="group-hover:scale-105 transition-transform">Discover Gaming Machines</span>
                </Link>
                <Link to="/products?type=vending" className="btn-secondary group">
                  <span className="group-hover:scale-105 transition-transform">Browse Smart Vendors</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className="py-20 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
          <div className="container-custom relative z-10">
            <div className={`text-center mb-16 transition-all duration-1000 ${featuresInView ? 'opacity-100' : 'opacity-0'}`}>
              <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-brand-green">Why Choose Vlitrix?</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Discover the future of gaming entertainment with our innovative technology
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Truck, title: "Fast Delivery", desc: "Lightning-fast shipping with premium packaging and white-glove service.", delay: "delay-100" },
                { icon: CreditCard, title: "Secure Payment", desc: "Advanced encryption and multiple payment options for your peace of mind.", delay: "delay-200" },
                { icon: Clock, title: "24/7 Support", desc: "Round-the-clock technical assistance from our expert team.", delay: "delay-300" },
                { icon: ShieldCheck, title: "100% Secure", desc: "Military-grade security for all your personal and business data.", delay: "delay-400" }
              ].map((feature, index) => (
                <div key={index} className={`group transition-all duration-1000 ${featuresInView ? `opacity-100 ${feature.delay}` : 'opacity-0'}`}>
                  <div className="flex flex-col items-center text-center p-8 rounded-xl bg-gradient-to-b from-gray-900 to-black border border-brand-green/20 hover:border-brand-green/60 transition-all duration-500">
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
        <section ref={productsRef} className="py-20 bg-black relative overflow-hidden">
          <div className="container-custom relative z-10">
            <div className={`text-center mb-16 transition-all duration-1000 ${productsInView ? 'opacity-100' : 'opacity-0'}`}>
              <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-brand-green">Featured Gaming Machines</h2>
              <p className="text-gray-400 max-w-3xl mx-auto text-lg">
                Experience the perfect blend of cutting-edge technology and entertainment with our premium claw and vending machines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {featuredProducts.map((product, index) => (
                product && (
                  <div key={product.id} className={`transition-all duration-1000 ${productsInView ? `opacity-100 delay-${(index + 1) * 100}` : 'opacity-0'}`}>
                    <ProductCard product={product} />
                  </div>
                )
              ))}
            </div>

            <div className={`text-center mt-16 transition-all duration-1000 ${productsInView ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/products?type=claw" className="btn-secondary group">
                  <span className="group-hover:scale-105 transition-transform">View All Gaming Machines</span>
                </Link>
                <Link to="/products?type=vending" className="btn-secondary group">
                  <span className="group-hover:scale-105 transition-transform">View All Smart Vendors</span>
                </Link>
                <button 
                  onClick={handleExploreAllProducts}
                  className="btn-primary group"
                >
                  <span className="group-hover:scale-105 transition-transform">Explore All Products</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section - Updated */}
        <section ref={techRef} className="py-20 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
          <div className="container-custom relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className={`transition-all duration-1000 ${techInView ? 'opacity-100' : 'opacity-0'}`}>
                <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-brand-green">Advanced Engineering</h2>
                <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                  Our machines feature state-of-the-art technology including smart automation systems, 
                  precision engineering, and advanced user interfaces that deliver exceptional gaming experiences.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { icon: Zap, title: "Smart Systems", desc: "Intelligent automation" },
                    { icon: Cpu, title: "Precision Tech", desc: "Engineered excellence" },
                    { icon: Award, title: "Premium Quality", desc: "Superior craftsmanship" }
                  ].map((tech, index) => (
                    <div key={index} className={`text-center transition-all duration-1000 ${techInView ? `opacity-100` : 'opacity-0'}`}>
                      <div className="bg-brand-green/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 hover:bg-brand-green/20 transition-colors group">
                        <tech.icon className="h-8 w-8 text-brand-green" />
                      </div>
                      <h4 className="font-semibold text-white mb-1">{tech.title}</h4>
                      <p className="text-sm text-gray-400">{tech.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={`relative transition-all duration-1000 ${techInView ? 'opacity-100 scale-100 delay-300' : 'opacity-0 scale-95'}`}>
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

        {/* Updated CTA Section */}
        <section ref={ctaRef} className="py-20 bg-black relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-green to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-brand-green to-transparent"></div>
          </div>
          
          <div className="container-custom relative z-10">
            <div className={`bg-gradient-to-r from-gray-900 via-black to-gray-900 border border-brand-green/30 rounded-2xl p-12 md:p-16 text-center transition-all duration-1000 ${ctaInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-brand-green">Ready to Elevate Your Business?</h2>
              <p className="text-gray-300 mb-10 text-xl max-w-3xl mx-auto">
                Join innovative businesses worldwide who have transformed their customer experience with our cutting-edge gaming machines and technology solutions.
              </p>
              <button 
                onClick={handleExploreAllProducts}
                className="bg-brand-green text-black font-medium py-4 px-8 rounded-md hover:bg-brand-green/90 transition-colors duration-300 text-lg"
              >
                Explore All Products
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
