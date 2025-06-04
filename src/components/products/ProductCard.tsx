
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
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
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    });
  };

  return (
    <Card className="group bg-gray-900/50 border-gray-800 hover:border-brand-green/50 transition-all duration-500 overflow-hidden">
      <div className="relative overflow-hidden">
        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleWishlistToggle}
              className={`p-2 rounded-full backdrop-blur-md border transition-all duration-300 ${
                isWishlisted 
                  ? 'bg-brand-green/20 border-brand-green text-brand-green' 
                  : 'bg-black/20 border-white/20 text-white hover:bg-brand-green/20 hover:border-brand-green'
              }`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddToCart}
              className="p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-brand-green/20 hover:border-brand-green transition-all duration-300"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>

          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 bg-brand-green/90 text-black text-xs font-semibold rounded-full backdrop-blur-sm">
              {product.series}
            </span>
          </div>
        </div>

        <CardContent className="p-6 relative z-10 bg-gray-900/80 backdrop-blur-sm">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-green transition-colors">
                {product.name}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-brand-green">
                  {currentCurrency.symbol}{convertedPrice.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {currentCurrency.code}
                </span>
              </div>
              
              <Link to={`/products/${product.id}`}>
                <Button 
                  variant="outline" 
                  className="bg-black text-white border-gray-600 hover:bg-gray-800"
                >
                  View Details
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white capitalize">{product.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Stock:</span>
                  <span className="text-white">{product.stock}</span>
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
