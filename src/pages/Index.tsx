import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, Clock, Zap, Cpu, Award } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProducts } from '@/hooks/use-products';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { t } = useLanguage();
  const { products, loading } = useProducts();

  // Get first 3 in-stock products as featured
  const featuredProducts = products.filter(p => p.in_stock).slice(0, 3);

  const { ref: heroRef, inView: heroInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: featuresRef, inView: featuresInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: productsRef, inView: productsInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: techRef, inView: techInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: ctaRef, inView: ctaInView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section ref={heroRef} className="relative h-screen flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-transparent z-10"></div>
          <div className="container-custom relative z-20">
            <div className={`max-w-3xl transition-all duration-1000 ${heroInView ? 'opacity-100' : 'opacity-0'}`}>
              <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="block text-stone-50">{t('hero_title_1')}</span>
                <span className="block bg-clip-text bg-gradient-to-r from-white to-green-500 text-stone-50">{t('hero_title_2')}</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                {t('hero_desc')}{' '}
                <span className="text-green-500 font-semibold">{t('hero_claw')}</span> {t('hero_and')}{' '}
                <span className="text-green-500 font-semibold">{t('hero_vending')}</span>{' '}
                {t('hero_desc_2')}
              </p>
              <div className="flex flex-wrap gap-6">
                <Link to="/products" className="bg-green-500 text-black font-medium py-4 px-8 rounded-md hover:bg-green-400 hover:text-black transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25">
                  {t('explore_products')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className="py-20 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
          <div className="container-custom relative z-10">
            <div className={`text-center mb-16 transition-all duration-1000 ${featuresInView ? 'opacity-100' : 'opacity-0'}`}>
              <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-brand-green">{t('why_choose')}</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">{t('why_choose_desc')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Truck, titleKey: "fast_delivery", descKey: "fast_delivery_desc", delay: "delay-100" },
                { icon: CreditCard, titleKey: "secure_payment", descKey: "secure_payment_desc", delay: "delay-200" },
                { icon: Clock, titleKey: "support_24_7", descKey: "support_24_7_desc", delay: "delay-300" },
                { icon: ShieldCheck, titleKey: "secure_100", descKey: "secure_100_desc", delay: "delay-400" },
              ].map((feature, index) => (
                <div key={index} className={`group transition-all duration-1000 ${featuresInView ? `opacity-100 ${feature.delay}` : 'opacity-0'}`}>
                  <div className="flex flex-col items-center text-center p-8 rounded-xl bg-gradient-to-b from-gray-900 to-black border border-brand-green/20 hover:border-brand-green/60 transition-all duration-500">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-brand-green/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                      <feature.icon className="h-16 w-16 text-brand-green relative z-10 group-hover:animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-brand-green transition-colors">{t(feature.titleKey)}</h3>
                    <p className="text-gray-400 leading-relaxed">{t(feature.descKey)}</p>
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
              <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-500">{t('featured_machines')}</h2>
              <p className="text-gray-400 max-w-3xl mx-auto text-lg">{t('featured_desc')}</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-96 bg-gray-800 rounded-lg" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {featuredProducts.map((product, index) => (
                  <div key={product.id} className={`transition-all duration-1000 ${productsInView ? `opacity-100 delay-${(index + 1) * 100}` : 'opacity-0'}`}>
                    <ProductCard product={product as any} />
                  </div>
                ))}
              </div>
            )}

            <div className={`text-center mt-16 transition-all duration-1000 ${productsInView ? 'opacity-100' : 'opacity-0'}`}>
              <Link to="/products" className="bg-green-500 text-black font-medium py-3 px-6 rounded-md hover:bg-green-400 hover:text-black transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25">
                {t('explore_products')}
              </Link>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section ref={techRef} className="py-20 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
          <div className="container-custom relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className={`transition-all duration-1000 ${techInView ? 'opacity-100' : 'opacity-0'}`}>
                <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-500">{t('advanced_engineering')}</h2>
                <p className="text-gray-300 mb-8 text-lg leading-relaxed">{t('advanced_desc')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { icon: Zap, titleKey: "smart_systems", descKey: "smart_systems_desc" },
                    { icon: Cpu, titleKey: "precision_tech", descKey: "precision_tech_desc" },
                    { icon: Award, titleKey: "premium_quality", descKey: "premium_quality_desc" },
                  ].map((tech, index) => (
                    <div key={index} className="text-center">
                      <div className="bg-green-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 hover:bg-green-500/20 transition-colors group">
                        <tech.icon className="h-8 w-8 text-green-500" />
                      </div>
                      <h4 className="font-semibold text-white mb-1">{t(tech.titleKey)}</h4>
                      <p className="text-sm text-gray-400">{t(tech.descKey)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`relative transition-all duration-1000 ${techInView ? 'opacity-100 scale-100 delay-300' : 'opacity-0 scale-95'}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent rounded-lg blur-xl"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-black p-8 rounded-xl border border-green-500/30">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-green-500 mb-2">99.9%</div>
                    <div className="text-gray-300">{t('uptime_reliability')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef} className="py-20 bg-black relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-green-500 to-transparent"></div>
          </div>
          <div className="container-custom relative z-10">
            <div className={`bg-gradient-to-r from-gray-900 via-black to-gray-900 border border-green-500/30 rounded-2xl p-12 md:p-16 text-center transition-all duration-1000 ${ctaInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-500">{t('ready_elevate')}</h2>
              <p className="text-gray-300 mb-10 text-xl max-w-3xl mx-auto">{t('ready_desc')}</p>
              <Link to="/products" className="bg-green-500 text-black font-medium py-4 px-8 rounded-md hover:bg-green-400 hover:text-black transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25 text-lg">
                {t('explore_products')}
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
