
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Zap, Cog } from 'lucide-react';

import { Product } from '@/data/products';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addItem(product);
  };
  
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const getMachineIcon = () => {
    return product.type === 'claw' ? <Zap className="h-4 w-4" /> : <Cog className="h-4 w-4" />;
  };

  return (
    <Link to={`/products/${product.id}`} className="block group">
      <div className="relative bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-xl overflow-hidden hover:border-brand-green/60 transition-all duration-500 card-hover glow-effect">
        {/* Machine type indicator */}
        <div className="absolute top-4 left-4 z-10 bg-brand-green/20 backdrop-blur-sm text-brand-green px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          {getMachineIcon()}
          {product.type === 'claw' ? 'Claw Machine' : 'Vending Machine'}
        </div>

        <div className="aspect-square bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 tech-border opacity-50"></div>
          
          <img 
            src={product.image} 
            alt={product.name} 
            className="object-contain w-full h-full p-6 transition-all duration-500 group-hover:scale-110 relative z-10"
          />
          
          {/* Price tag with glow effect */}
          <div className="absolute top-4 right-4 bg-brand-green text-black font-bold py-2 px-4 rounded-full shadow-lg pulse-glow z-10">
            {product.price.toLocaleString()} EGP
          </div>
          
          {/* Wishlist button */}
          <button 
            onClick={handleWishlistToggle}
            className={`absolute bottom-4 left-4 p-3 rounded-full transition-all duration-300 hover-scale z-10 ${
              inWishlist 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                : 'bg-gray-800/80 backdrop-blur-sm text-white hover:bg-gray-700'
            }`}
          >
            <Heart className="h-4 w-4" fill={inWishlist ? "currentColor" : "none"} />
          </button>

          {/* Floating particles effect */}
          <div className="absolute top-[20%] right-[30%] w-1 h-1 bg-brand-green/60 rounded-full animate-bounce delay-300 opacity-60"></div>
          <div className="absolute bottom-[30%] left-[25%] w-2 h-2 bg-brand-green/40 rounded-full animate-bounce delay-700 opacity-40"></div>
        </div>
        
        <div className="p-6 relative z-10">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold group-hover:text-brand-green transition-colors">{product.name}</h3>
              <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">{product.series}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="capitalize">{product.category}</span>
              <span>•</span>
              <span>{product.stock} in stock</span>
            </div>
          </div>
          
          <p className="text-gray-300 line-clamp-2 mb-6 leading-relaxed">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-brand-green hover:text-brand-green/80 font-semibold transition-colors group-hover:neon-glow">
              View Details →
            </span>
            
            <Button 
              size="sm" 
              onClick={handleAddToCart} 
              className="bg-brand-green hover:bg-brand-green/90 text-black font-semibold hover-scale transition-all duration-300 shadow-lg hover:shadow-brand-green/30"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </div>
    </Link>
  );
};

export default ProductCard;
