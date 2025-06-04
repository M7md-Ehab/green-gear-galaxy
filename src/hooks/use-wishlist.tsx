
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { Product } from '@/data/products';

interface WishlistState {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  itemsCount: () => number;
}

export const useWishlist = create(
  persist<WishlistState>(
    (set, get) => ({
      items: [],
      
      addToWishlist: (product) => {
        const { items } = get();
        const existingItem = items.find(item => item.id === product.id);
        
        if (!existingItem) {
          set({ items: [...items, product] });
          toast.success(`${product.name} added to wishlist!`);
        } else {
          toast.info(`${product.name} is already in your wishlist`);
        }
      },
      
      removeFromWishlist: (productId) => {
        const { items } = get();
        const product = items.find(item => item.id === productId);
        set({ items: items.filter(item => item.id !== productId) });
        
        if (product) {
          toast.success(`${product.name} removed from wishlist`);
        }
      },
      
      isInWishlist: (productId) => {
        const { items } = get();
        return items.some(item => item.id === productId);
      },
      
      clearWishlist: () => {
        set({ items: [] });
        toast.success('Wishlist cleared');
      },
      
      itemsCount: () => {
        const { items } = get();
        return items.length;
      }
    }),
    {
      name: 'vlitrix-wishlist'
    }
  )
);
