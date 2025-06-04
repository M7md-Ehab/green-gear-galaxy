
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
    addToCart(product);
  };

  return (
    <Card className="group bg-white border border-gray-200 hover:shadow-lg overflow-hidden">
      <div className="relative overflow-hidden">
        <div className="aspect-square bg-gray-50 relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleWishlistToggle}
              className={`p-2 rounded-full bg-white shadow-md border ${
                isWishlisted 
                  ? 'text-red-500' 
                  : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddToCart}
              className="p-2 rounded-full bg-white shadow-md border text-gray-600 hover:text-black"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>

          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 bg-black text-white text-xs font-semibold rounded-full">
              {product.series}
            </span>
          </div>
        </div>

        <CardContent className="p-6 bg-white">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-black">
                  {currentCurrency.symbol}{convertedPrice.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {currentCurrency.code}
                </span>
              </div>
              
              <Link to={`/products/${product.id}`}>
                <Button 
                  variant="outline" 
                  className="bg-black text-white border-black hover:bg-gray-800"
                >
                  View Details
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="text-gray-900 capitalize">{product.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Stock:</span>
                  <span className="text-gray-900">{product.stock}</span>
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
