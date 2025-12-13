import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: name.trim() }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('Category already exists');
          return null;
        }
        throw error;
      }

      toast.success('Category created');
      await fetchCategories();
      return data;
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error('Failed to create category');
      return null;
    }
  };

  return {
    categories,
    loading,
    addCategory,
    fetchCategories,
  };
};
