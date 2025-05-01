
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

import { Product } from '@/data/products';
import { useAuth } from '@/hooks/use-auth';

interface WishlistStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlist = create(
  persist<WishlistStore>(
    (set, get) => ({
      items: [],
      addItem: (product: Product) => {
        const auth = useAuth.getState();
        if (!auth.isLoggedIn) {
          toast.error('Please login first', {
            description: 'You need to be logged in to add items to your wishlist'
          });
          return;
        }
        
        const currentItems = get().items;
        const existingItem = currentItems.find(item => item.id === product.id);
        
        if (!existingItem) {
          set({
            items: [...currentItems, product]
          });
          
          // Also store in user's data for persistence
          updateUserWishlist([...currentItems, product]);
          
          toast.success('Added to wishlist', {
            description: `${product.name} has been added to your wishlist.`
          });
        } else {
          toast.info('Already in wishlist', {
            description: `${product.name} is already in your wishlist.`
          });
        }
      },
      removeItem: (productId: string) => {
        const currentItems = get().items;
        
        const newItems = currentItems.filter(item => item.id !== productId);
        set({ items: newItems });
        
        // Also update in user's data
        updateUserWishlist(newItems);
        
        toast.success('Removed from wishlist', {
          description: 'The item has been removed from your wishlist.'
        });
      },
      isInWishlist: (productId: string) => {
        return get().items.some(item => item.id === productId);
      },
      clearWishlist: () => {
        set({ items: [] });
        
        // Also clear in user's data
        updateUserWishlist([]);
        
        toast.success('Wishlist cleared', {
          description: 'All items have been removed from your wishlist.'
        });
      }
    }),
    {
      name: 'mehab-wishlist'
    }
  )
);

// Helper function to update user's wishlist in storage
function updateUserWishlist(products: Product[]) {
  const auth = useAuth.getState();
  if (!auth.isLoggedIn || !auth.user) return;
  
  const users = JSON.parse(localStorage.getItem('mehab-users') || '[]');
  const userIndex = users.findIndex((u: any) => u.id === auth.user?.id);
  
  if (userIndex !== -1) {
    users[userIndex].wishlist = products.map(p => p.id);
    localStorage.setItem('mehab-users', JSON.stringify(users));
  }
}

// Initialize wishlist with user's saved wishlist on login
if (typeof window !== 'undefined') {
  const auth = useAuth.getState();
  if (auth.isLoggedIn && auth.user) {
    const users = JSON.parse(localStorage.getItem('mehab-users') || '[]');
    const user = users.find((u: any) => u.id === auth.user?.id);
    
    if (user && user.wishlist) {
      // Need to load products from product IDs
      // This would be a backend call in a real application
    }
  }
}
