
import { useState, useEffect } from 'react';
import { Product } from '@/data/products';
import { 
  addProductToFirebase, 
  updateProductInFirebase, 
  deleteProductFromFirebase,
  uploadProductImage,
  subscribeToProducts
} from '@/services/firebase-products';
import { toast } from 'sonner';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToProducts((firebaseProducts) => {
      setProducts(firebaseProducts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>, images?: File[]) => {
    try {
      let imageUrls = ['/placeholder.svg'];
      
      const productId = await addProductToFirebase(product);
      
      if (images && images.length > 0) {
        const uploadPromises = images.map((file, index) => 
          uploadProductImage(file, productId, index)
        );
        imageUrls = await Promise.all(uploadPromises);
        
        // Update product with image URLs
        await updateProductInFirebase(productId, { images: imageUrls });
      }
      
      toast.success('Product added successfully');
      return productId;
    } catch (error) {
      toast.error('Failed to add product');
      throw error;
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>, newImages?: File[]) => {
    try {
      let imageUrls = updates.images || [];
      
      if (newImages && newImages.length > 0) {
        const uploadPromises = newImages.map((file, index) => 
          uploadProductImage(file, productId, index)
        );
        const newImageUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newImageUrls];
      }
      
      await updateProductInFirebase(productId, { ...updates, images: imageUrls });
      toast.success('Product updated successfully');
    } catch (error) {
      toast.error('Failed to update product');
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await deleteProductFromFirebase(productId);
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Failed to delete product');
      throw error;
    }
  };

  const getUniqueSeries = () => {
    const seriesSet = new Set(products.map(product => product.series.charAt(0)));
    return Array.from(seriesSet).sort();
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    getUniqueSeries
  };
};
