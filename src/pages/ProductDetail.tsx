
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, CreditCard } from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/hooks/use-cart';
import { useCurrency } from '@/hooks/use-currency';
import { products } from '@/data/products';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { currentCurrency } = useCurrency();
  const { t } = useLanguage();

  const product = products.find(p => p.id === productId);

  // If product doesn't exist, show not found message
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-12">
          <div className="container-custom text-center">
            <div className="max-w-md mx-auto">
              <h1 className="text-4xl font-bold mb-4">{t('product_not_found')}</h1>
              <p className="text-gray-400 mb-8">{t('product_not_found_desc')}</p>
              <Button 
                onClick={() => navigate('/products')}
                className="bg-brand-green hover:bg-brand-green/90 text-black"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('back_to_products')}
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom">
          <Button
            variant="ghost"
            onClick={() => navigate('/products')}
            className="mb-8 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('back_to_products')}
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-800">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                <p className="text-xl text-brand-green font-bold">
                  {currentCurrency.symbol}{product.price.toLocaleString()} {currentCurrency.code}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-300 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleAddToCart}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {t('add_to_cart')}
                </Button>
                
                <Button 
                  onClick={handleBuyNow}
                  className="w-full bg-brand-green hover:bg-brand-green/90 text-black"
                  size="lg"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  {t('buy_now')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
