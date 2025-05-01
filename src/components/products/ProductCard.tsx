
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';

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

  return (
    <Link to={`/products/${product.id}`} className="block">
      <div className="group bg-black border border-gray-800 rounded-lg overflow-hidden hover:border-brand-green/40 transition-all">
        <div className="aspect-square bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="object-contain w-full h-full p-6 transition-transform group-hover:scale-105"
          />
          {/* Price tag */}
          <div className="absolute top-4 right-4 bg-brand-green text-black font-bold py-1 px-3 rounded-full">
            {product.price.toLocaleString()} EGP
          </div>
          
          {/* Wishlist button */}
          <button 
            onClick={handleWishlistToggle}
            className={`absolute top-4 left-4 p-2 rounded-full ${
              inWishlist ? 'bg-red-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            <Heart className="h-4 w-4" fill={inWishlist ? "currentColor" : "none"} />
          </button>
        </div>
        
        <div className="p-5">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-1">{product.name}</h3>
            <p className="text-sm text-gray-400">{product.series}</p>
          </div>
          
          <p className="text-gray-300 line-clamp-2 mb-4">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-brand-green hover:text-brand-green/80 font-medium">
              View Details
            </span>
            
            <Button 
              size="sm" 
              onClick={handleAddToCart} 
              className="bg-brand-green hover:bg-brand-green/90 text-black"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
