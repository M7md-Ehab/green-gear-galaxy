
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, ShoppingCart, Check, Heart } from 'lucide-react';

import { getProductById } from '@/data/products';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  
  const product = id ? getProductById(id) : undefined;
  
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <div className="container-custom py-12 flex-grow flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-gray-400 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/products')}>
            Browse Products
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  
  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = () => {
    // Add the product to cart multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    
    toast.success('Added to cart', {
      description: `${quantity} ${product.name} ${quantity > 1 ? 'have' : 'has'} been added to your cart.`
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-400 mb-8">
            <Link to="/" className="hover:text-brand-green">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-brand-green">Products</Link>
            <span className="mx-2">/</span>
            <span className="text-brand-green">{product.name}</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden relative">
              <div className="aspect-square relative">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="object-contain w-full h-full p-8"
                />
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
            
            {/* Product Info */}
            <div>
              <div className="mb-6">
                <div className="text-brand-green font-medium mb-2">{product.series}</div>
                <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                <p className="text-3xl font-bold mb-6">{product.price.toLocaleString()} EGP</p>
                <p className="text-gray-300">{product.description}</p>
              </div>
              
              {/* Features */}
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4">Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-brand-green mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Quantity Selector */}
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4">Quantity</h3>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="border-gray-600 text-white bg-gray-800"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <span className="mx-4 w-8 text-center">{quantity}</span>
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="border-gray-600 text-white bg-gray-800"
                    disabled={quantity >= product.stock}
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  
                  <span className="ml-4 text-sm text-gray-400">
                    {product.stock} units available
                  </span>
                </div>
              </div>
              
              {/* Add to Cart */}
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-brand-green hover:bg-brand-green/90 text-black"
                  size="lg"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                
                <Button variant="outline" className="border-gray-600 text-white bg-gray-800" size="lg" asChild>
                  <Link to="/cart">
                    View Cart
                  </Link>
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
