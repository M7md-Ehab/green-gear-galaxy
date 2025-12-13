import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Trash2, ShoppingCart, ExternalLink } from 'lucide-react';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCart } from '@/hooks/use-cart';
import { useCurrency } from '@/hooks/use-currency';
import { Product } from '@/data/products';

const WishlistSection = () => {
  const navigate = useNavigate();
  const { items: wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const handleViewProduct = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Heart className="h-5 w-5 text-brand-green" />
            My Wishlist
            {wishlistItems.length > 0 && (
              <span className="text-sm font-normal text-gray-400">
                ({wishlistItems.length} items)
              </span>
            )}
          </CardTitle>
          {wishlistItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearWishlist}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {wishlistItems.length > 0 ? (
          <div className="space-y-3">
            {wishlistItems.map((product: Product) => (
              <div 
                key={product.id} 
                className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors"
              >
                {/* Product Image */}
                <div 
                  className="w-16 h-16 rounded-md overflow-hidden bg-gray-700 flex-shrink-0 cursor-pointer"
                  onClick={() => handleViewProduct(product.id)}
                >
                  <img
                    src={product.images?.[0] || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform"
                  />
                </div>
                
                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 
                    className="font-medium text-white truncate cursor-pointer hover:text-brand-green transition-colors"
                    onClick={() => handleViewProduct(product.id)}
                  >
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-400 truncate">{product.series || product.type}</p>
                  <p className="text-brand-green font-semibold mt-1">
                    {formatPrice(product.price)}
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleAddToCart(product)}
                    className="h-8 w-8 text-gray-400 hover:text-brand-green hover:bg-brand-green/10"
                    title="Add to Cart"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleViewProduct(product.id)}
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                    title="View Product"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFromWishlist(product.id)}
                    className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <Button 
              onClick={() => navigate('/products')} 
              variant="outline" 
              className="w-full mt-4 border-gray-700 text-white bg-gray-800/50 hover:bg-gray-700"
            >
              Browse More Products
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="mb-2">Your wishlist is empty</p>
            <p className="text-sm text-gray-500 mb-4">
              Save items you love to your wishlist
            </p>
            <Button 
              onClick={() => navigate('/products')} 
              className="bg-brand-green hover:bg-brand-green/90 text-black"
            >
              Browse Products
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WishlistSection;
