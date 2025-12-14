
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  images: string[] | null;
  in_stock: boolean | null;
  inventory_count: number | null;
  series: string | null;
  type: string | null;
  specs: any;
  created_at: string | null;
  updated_at: string | null;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (onlyInStock = false) => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (onlyInStock) {
        query = query.eq('in_stock', true);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setProducts(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (product: { name: string; price: number; category: string; description?: string; inventory_count?: number; image_url?: string; images?: string[]; in_stock?: boolean }) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      toast.success('Product added successfully');
      await fetchProducts();
      return data.id;
    } catch (error: any) {
      toast.error('Failed to add product');
      throw error;
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId);

      if (error) {
        throw error;
      }
      
      toast.success('Product updated successfully');
      await fetchProducts(); // Refresh the products list
    } catch (error: any) {
      toast.error('Failed to update product');
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        throw error;
      }
      
      toast.success('Product deleted successfully');
      await fetchProducts(); // Refresh the products list
    } catch (error: any) {
      toast.error('Failed to delete product');
      throw error;
    }
  };

  const getProduct = async (id: string): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (err: any) {
      console.error('Error fetching product:', err);
      return null;
    }
  };

  const searchProducts = async (query: string, category?: string): Promise<Product[]> => {
    try {
      let queryBuilder = supabase
        .from('products')
        .select('*')
        .eq('in_stock', true);

      if (category && category !== 'all') {
        queryBuilder = queryBuilder.eq('category', category);
      }

      if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      }

      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err: any) {
      console.error('Error searching products:', err);
      return [];
    }
  };

  const getUniqueCategories = () => {
    const categoriesSet = new Set(products.map(product => product.category));
    return Array.from(categoriesSet).sort();
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    searchProducts,
    getUniqueCategories,
    fetchProducts,
  };
};
