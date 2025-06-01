
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

import { Product } from '@/data/products';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  addToCart: (product: Product) => void; // Add this alias
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  itemsCount: () => number;
}

export const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      addItem: (product: Product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(item => item.product.id === product.id);

        if (existingItem) {
          // If product already in cart, increase quantity
          set({
            items: currentItems.map(item => {
              if (item.product.id === product.id) {
                return {
                  ...item,
                  quantity: item.quantity + 1
                };
              }
              return item;
            })
          });
        } else {
          // If product not in cart, add it
          set({
            items: [...currentItems, { product, quantity: 1 }]
          });
        }

        toast.success('Added to cart', {
          description: `${product.name} has been added to your cart.`
        });
      },
      // Add alias for addToCart
      addToCart: (product: Product) => {
        get().addItem(product);
      },
      removeItem: (productId: string) => {
        const currentItems = get().items;
        
        set({
          items: currentItems.filter(item => item.product.id !== productId)
        });

        toast.success('Item removed', {
          description: 'The item has been removed from your cart.'
        });
      },
      updateQuantity: (productId: string, quantity: number) => {
        const currentItems = get().items;
        
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        // Check if requested quantity exceeds available stock
        const item = currentItems.find(item => item.product.id === productId);
        if (item && quantity > item.product.stock) {
          toast.error('Not enough stock', {
            description: `Only ${item.product.stock} units available.`
          });
          return;
        }
        
        set({
          items: currentItems.map(item => {
            if (item.product.id === productId) {
              return {
                ...item,
                quantity
              };
            }
            return item;
          })
        });
      },
      clearCart: () => {
        set({ items: [] });
      },
      cartTotal: () => {
        return get().items.reduce((total, item) => {
          return total + (item.product.price * item.quantity);
        }, 0);
      },
      itemsCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'tech-machines-cart'
    }
  )
);
