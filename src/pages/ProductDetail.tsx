
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/hooks/use-cart';
import { useCurrency } from '@/hooks/use-currency';
import { useProducts } from '@/hooks/use-products';
import { Product } from '@/data/products';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { currentCurrency, convertPrice } = useCurrency();
  const { t } = useLanguage();
  const { getProduct } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      setLoading(true);
      const data = await getProduct(productId);
      setProduct(data as Product | null);
      setLoading(false);
    };
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <main className="flex-grow py-12">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Skeleton className="aspect-square rounded-lg bg-gray-800" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4 bg-gray-800" />
                <Skeleton className="h-6 w-1/4 bg-gray-800" />
                <Skeleton className="h-24 w-full bg-gray-800" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
                className="bg-green-500 hover:bg-green-400 text-black"
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

  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : product.image_url 
      ? [product.image_url] 
      : ['/placeholder.svg'];

  const convertedPrice = convertPrice(product.price, 'EGP');

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleBuyNow = () => {
    navigate(`/direct-checkout?productId=${product.id}`);
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
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-800 relative group">
                <img
                  src={allImages[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {allImages.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentImageIndex((prev) => (prev + 1) % allImages.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex ? 'border-green-500' : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {product.series && (
                    <Badge className="bg-green-500 text-black">{product.series}</Badge>
                  )}
                  {product.type && (
                    <Badge variant="secondary" className="capitalize">{product.type}</Badge>
                  )}
                  {product.category && (
                    <Badge variant="outline">{product.category}</Badge>
                  )}
                </div>
                <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                <p className="text-xl text-green-500 font-bold">
                  {currentCurrency.symbol}{convertedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currentCurrency.code}
                </p>
              </div>

              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-300 leading-relaxed">{product.description}</p>
                </div>
              )}

              <div className="flex items-center gap-4">
                <span className="text-gray-400">Stock:</span>
                <span className={`font-semibold ${(product.inventory_count ?? 0) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(product.inventory_count ?? 0) > 0 ? `${product.inventory_count} available` : 'Out of Stock'}
                </span>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleAddToCart}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white"
                  size="lg"
                  disabled={!product.in_stock}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {t('add_to_cart')}
                </Button>
                
                <Button 
                  onClick={handleBuyNow}
                  className="w-full bg-green-500 hover:bg-green-400 text-black"
                  size="lg"
                  disabled={!product.in_stock}
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
