
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCart } from '@/hooks/use-cart';
import { useCurrency } from '@/hooks/use-currency';
import { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { currentCurrency, convertPrice } = useCurrency();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isWishlisted = isInWishlist(product.id);
  const convertedPrice = convertPrice(product.price, 'USD');

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <Card className="group bg-black border border-gray-800 hover:shadow-2xl hover:scale-105 overflow-hidden transition-all duration-300 hover:border-green-500 focus-within:border-green-500 focus-within:shadow-lg focus-within:shadow-green-500/20">
      <div className="relative overflow-hidden">
        <div className="aspect-square bg-gray-900 relative">
          <img
            src={product.images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
          
          {/* Image Navigation Arrows */}
          <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevImage}
              className="p-2 rounded-full bg-black/70 backdrop-blur-sm text-green-500 hover:text-green-400 hover:bg-black/80 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextImage}
              className="p-2 rounded-full bg-black/70 backdrop-blur-sm text-green-500 hover:text-green-400 hover:bg-black/80 transition-all duration-200"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Image Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex ? 'bg-green-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleWishlistToggle}
              className={`p-2 rounded-full bg-black/70 backdrop-blur-sm shadow-lg border ${
                isWishlisted 
                  ? 'text-red-500' 
                  : 'text-gray-400 hover:text-red-500'
              } hover:scale-110 transition-all duration-200`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddToCart}
              className="p-2 rounded-full bg-black/70 backdrop-blur-sm shadow-lg border text-gray-400 hover:text-green-500 hover:scale-110 transition-all duration-200"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>

          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 bg-green-500 text-black text-xs font-semibold rounded-full group-hover:bg-green-400 transition-all duration-300">
              {product.series}
            </span>
          </div>
        </div>

        <CardContent className="p-6 bg-black group-hover:bg-gray-900 transition-colors duration-300">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-green-500 mb-2 transition-colors duration-300">
                {product.name}
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 text-sm line-clamp-2 leading-relaxed transition-colors duration-300">
                {product.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-green-500 group-hover:text-green-400 transition-colors duration-300">
                  {currentCurrency.symbol}{convertedPrice.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500 group-hover:text-gray-400 uppercase tracking-wide transition-colors duration-300">
                  {currentCurrency.code}
                </span>
              </div>
              
              <Link to={`/products/${product.id}`}>
                <Button 
                  variant="outline" 
                  className="bg-green-500 text-black border-green-500 hover:bg-green-400 hover:text-black hover:border-green-400 transition-all duration-300 hover:scale-105 group-hover:bg-green-400 group-hover:text-black group-hover:border-green-400"
                >
                  View Details
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t border-gray-800 group-hover:border-green-500/30 transition-colors duration-300">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 group-hover:text-gray-400 transition-colors duration-300">Type:</span>
                  <span className="text-gray-300 group-hover:text-white capitalize transition-colors duration-300">{product.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 group-hover:text-gray-400 transition-colors duration-300">Stock:</span>
                  <span className="text-gray-300 group-hover:text-white transition-colors duration-300">{product.stock}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default ProductCard;
