import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Warehouse, Search, AlertTriangle, Edit, Save, X, Plus, Trash } from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';
import { useProducts, Product } from '@/hooks/use-products';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Category { id: string; name: string; }
interface MachineType { id: string; name: string; }

const InventoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editType, setEditType] = useState('');
  const [editSeries, setEditSeries] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newMachineType, setNewMachineType] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  
  const { formatPrice, currentCurrency } = useCurrency();
  const { products, loading, addProduct, updateProduct, deleteProduct, fetchProducts } = useProducts();
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    refreshProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);
    };
    const fetchMachineTypes = async () => {
      const { data } = await supabase.from('machine_types').select('*').order('name');
      if (data) setMachineTypes(data);
    };
    fetchCategories();
    fetchMachineTypes();
  }, []);

  const displayProducts = allProducts.length > 0 ? allProducts : products;
  
  const filteredProducts = displayProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = displayProducts.filter(product => (product.inventory_count ?? 0) < 10);

  const handleEdit = (product: Product) => {
    setEditingProduct(product.id);
    setEditPrice(product.price.toString());
    setEditStock((product.inventory_count ?? 0).toString());
    setEditName(product.name);
    setEditDescription(product.description || '');
    setEditCategory(product.category);
    setEditType(product.type || '');
    setEditSeries(product.series || '');
    // Load ALL images from the images array
    const imgs = product.images && product.images.length > 0 
      ? [...product.images] 
      : product.image_url 
        ? [product.image_url] 
        : [];
    setEditImages(imgs);
  };

  const handleSave = async (productId: string) => {
    const newPrice = parseFloat(editPrice);
    const newStock = parseInt(editStock);
    
    if (isNaN(newPrice) || isNaN(newStock) || newPrice <= 0 || newStock < 0) {
      toast.error('Please enter valid price and stock values');
      return;
    }
    if (!editName.trim() || !editCategory.trim()) {
      toast.error('Name and category are required');
      return;
    }

    const updates: Partial<Product> = {
      price: newPrice,
      inventory_count: newStock,
      name: editName.trim(),
      description: editDescription.trim(),
      category: editCategory.trim(),
      type: editType || null,
      series: editSeries.trim() || null,
      image_url: editImages[0] || '/placeholder.svg',
      images: editImages,
      in_stock: newStock > 0,
    };

    await updateProduct(productId, updates);
    handleCancel();
    refreshProducts();
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setEditPrice(''); setEditStock(''); setEditName('');
    setEditDescription(''); setEditCategory(''); setEditType('');
    setEditSeries(''); setEditImages([]); setNewCategory('');
    setNewMachineType(''); setImageUrl('');
  };

  const handleDelete = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(productId);
      refreshProducts();
    }
  };

  const refreshProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setAllProducts(data as Product[]);
  };

  const handleAddProduct = async () => {
    const newPrice = parseFloat(editPrice);
    const newStock = parseInt(editStock);
    
    if (isNaN(newPrice) || isNaN(newStock) || newPrice <= 0 || newStock < 0) {
      toast.error('Please enter valid price and stock values');
      return;
    }
    if (!editName.trim() || !editCategory.trim()) {
      toast.error('Name and category are required');
      return;
    }

    const newProduct = {
      name: editName.trim(),
      price: newPrice,
      description: editDescription.trim(),
      category: editCategory.trim(),
      inventory_count: newStock,
      image_url: editImages[0] || '/placeholder.svg',
      images: editImages,
      in_stock: newStock > 0,
    };

    // Include type and series via updateProduct after creation
    const productId = await addProduct(newProduct);
    if (productId && (editType || editSeries)) {
      await supabase.from('products').update({ 
        type: editType || null, 
        series: editSeries.trim() || null 
      }).eq('id', productId);
    }

    setShowAddForm(false);
    handleCancel();
    refreshProducts();
  };

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;
    const { data, error } = await supabase.from('categories').insert({ name: newCategory.trim() }).select().single();
    if (!error && data) {
      setCategories([...categories, data]);
      setEditCategory(newCategory.trim());
      setNewCategory('');
      toast.success('Category created');
    } else {
      toast.error(error?.code === '23505' ? 'Category already exists' : 'Failed to create category');
    }
  };

  const handleCreateMachineType = async () => {
    if (!newMachineType.trim()) return;
    const { data, error } = await supabase.from('machine_types').insert({ name: newMachineType.trim() }).select().single();
    if (!error && data) {
      setMachineTypes([...machineTypes, data]);
      setEditType(newMachineType.trim());
      setNewMachineType('');
      toast.success('Machine type created');
    } else {
      toast.error(error?.code === '23505' ? 'Machine type already exists' : 'Failed to create machine type');
    }
  };

  const addImageUrl = () => {
    if (imageUrl.trim() && !editImages.includes(imageUrl.trim())) {
      setEditImages([...editImages, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setEditImages(editImages.filter((_, i) => i !== index));
  };

  if (loading && allProducts.length === 0) {
    return <div className="flex items-center justify-center h-64"><div className="text-white">Loading products...</div></div>;
  }

  const ProductForm = ({ isEdit = false, onSubmit }: { isEdit?: boolean; onSubmit: () => void }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Product Name *</label>
          <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-gray-700 border-gray-600 text-white" placeholder="Product name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Category *</label>
          <div className="flex gap-2">
            <Select value={editCategory} onValueChange={setEditCategory}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white flex-1"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.name} className="text-white">{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="border-gray-600 hover:bg-gray-700"><Plus className="h-4 w-4" /></Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700">
                <DialogHeader><DialogTitle className="text-white">Create New Category</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Category name" className="bg-gray-700 border-gray-600 text-white" />
                  <Button onClick={handleCreateCategory} className="w-full bg-brand-green hover:bg-brand-green/90 text-black">Create Category</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Machine Type</label>
          <div className="flex gap-2">
            <Select value={editType} onValueChange={setEditType}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white flex-1"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="none" className="text-white">None</SelectItem>
                {machineTypes.map(mt => (
                  <SelectItem key={mt.id} value={mt.name} className="text-white capitalize">{mt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="border-gray-600 hover:bg-gray-700"><Plus className="h-4 w-4" /></Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700">
                <DialogHeader><DialogTitle className="text-white">Create Machine Type</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Input value={newMachineType} onChange={(e) => setNewMachineType(e.target.value)} placeholder="Machine type name" className="bg-gray-700 border-gray-600 text-white" />
                  <Button onClick={handleCreateMachineType} className="w-full bg-brand-green hover:bg-brand-green/90 text-black">Create Type</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Series</label>
          <Input value={editSeries} onChange={(e) => setEditSeries(e.target.value)} className="bg-gray-700 border-gray-600 text-white" placeholder="e.g. T1, S1, K1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Stock *</label>
          <Input value={editStock} onChange={(e) => setEditStock(e.target.value)} className="bg-gray-700 border-gray-600 text-white" placeholder="Stock quantity" type="number" min="0" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Price ({currentCurrency.symbol}) *</label>
        <Input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="bg-gray-700 border-gray-600 text-white" placeholder="Price" type="number" min="0" step="0.01" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="bg-gray-700 border-gray-600 text-white" placeholder="Product description" rows={3} />
      </div>
      
      {/* Image Management */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Product Images</label>
        <div className="flex gap-2 mb-3">
          <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="bg-gray-700 border-gray-600 text-white flex-1" placeholder="Enter image URL" />
          <Button type="button" onClick={addImageUrl} variant="outline" className="border-gray-600 hover:bg-gray-700">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        {editImages.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {editImages.map((img, index) => (
              <div key={index} className="relative group">
                <img src={img} alt={`Product ${index + 1}`} className="w-full h-20 object-cover rounded-md border border-gray-600" />
                <Button type="button" size="icon" variant="destructive" onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-3 w-3" />
                </Button>
                {index === 0 && <Badge className="absolute bottom-1 left-1 text-xs bg-brand-green text-black">Main</Badge>}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button onClick={onSubmit} className="bg-brand-green hover:bg-brand-green/90 text-black">
          <Save className="h-4 w-4 mr-1" /> {isEdit ? 'Save Changes' : 'Add Product'}
        </Button>
        <Button variant="outline" onClick={() => { setShowAddForm(false); handleCancel(); }} className="border-gray-600 text-white hover:bg-gray-700">
          <X className="h-4 w-4 mr-1" /> Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Warehouse className="h-5 w-5 text-brand-green" />
          Inventory Management
          <Badge variant="secondary" className="ml-auto bg-brand-green/20 text-brand-green">{displayProducts.length} Products</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400" />
            </div>
            <Button onClick={() => setShowAddForm(true)} className="bg-brand-green hover:bg-brand-green/90 text-black">
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </div>

          {lowStockProducts.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-yellow-500 font-medium">Low Stock Alert</span>
              </div>
              <div className="space-y-1">
                {lowStockProducts.slice(0, 5).map(product => (
                  <div key={product.id} className="text-sm text-gray-300">{product.name} - Only {product.inventory_count} left</div>
                ))}
              </div>
            </div>
          )}

          {showAddForm && (
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><Plus className="h-5 w-5 text-brand-green" /> Add New Product</CardTitle></CardHeader>
              <CardContent><ProductForm onSubmit={handleAddProduct} /></CardContent>
            </Card>
          )}

          <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Warehouse className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No products found</p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <div key={product.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                  {editingProduct === product.id ? (
                    <ProductForm isEdit onSubmit={() => handleSave(product.id)} />
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-brand-green transition-all duration-200 flex-shrink-0"
                          onClick={() => window.open(`/products/${product.id}`, '_blank')}>
                          <img src={product.image_url || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-200" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-medium text-white">{product.name}</h3>
                            <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                            {product.type && <Badge variant="outline" className="text-xs capitalize">{product.type}</Badge>}
                            {product.series && <Badge className="text-xs bg-green-500/20 text-green-400">{product.series}</Badge>}
                            {!product.in_stock && <Badge variant="destructive" className="text-xs">Out of Stock</Badge>}
                          </div>
                          <p className="text-sm text-gray-300 line-clamp-2">{product.description}</p>
                          <div className="flex items-center gap-6 mt-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">Stock:</span>
                              <Badge variant={(product.inventory_count ?? 0) > 20 ? "default" : (product.inventory_count ?? 0) > 5 ? "secondary" : "destructive"}>
                                {product.inventory_count ?? 0}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">Price:</span>
                              <span className="text-sm font-semibold text-white">{formatPrice(product.price)}</span>
                            </div>
                            {product.images && product.images.length > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">Images:</span>
                                <span className="text-xs text-gray-300">{product.images.length}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(product)} className="text-gray-400 hover:text-white hover:bg-gray-700">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(product.id)} className="text-gray-400 hover:text-red-500 hover:bg-gray-700">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryManagement;
