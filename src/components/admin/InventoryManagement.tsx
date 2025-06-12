
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Warehouse, Search, Package, AlertTriangle, Edit, Save, X, Plus, Trash, Upload } from 'lucide-react';
import { products } from '@/data/products';
import { useCurrency } from '@/hooks/use-currency';
import { toast } from 'sonner';
import { Product } from '@/data/products';

const InventoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSeries, setEditSeries] = useState('');
  const [editType, setEditType] = useState<'vending' | 'claw'>('vending');
  const [showAddForm, setShowAddForm] = useState(false);
  const { formatPrice, currentCurrency } = useCurrency();
  
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.series.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(product => product.stock < 10);

  const handleEdit = (product: Product) => {
    setEditingProduct(product.id);
    setEditPrice(product.price.toString());
    setEditStock(product.stock.toString());
    setEditName(product.name);
    setEditDescription(product.description);
    setEditSeries(product.series);
    setEditType(product.type);
  };

  const handleSave = (productId: string) => {
    const newPrice = parseFloat(editPrice);
    const newStock = parseInt(editStock);
    
    if (isNaN(newPrice) || isNaN(newStock) || newPrice <= 0 || newStock < 0) {
      toast.error('Invalid price or stock value');
      return;
    }

    if (!editName.trim() || !editDescription.trim() || !editSeries.trim()) {
      toast.error('Name, description, and series cannot be empty');
      return;
    }

    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      products[productIndex] = {
        ...products[productIndex],
        price: newPrice,
        stock: newStock,
        name: editName.trim(),
        description: editDescription.trim(),
        series: editSeries.trim(),
        type: editType
      };
      
      toast.success(`Updated ${editName} successfully`);
      console.log(`Product ${productId} updated:`, products[productIndex]);
    }
    
    handleCancel();
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setEditPrice('');
    setEditStock('');
    setEditName('');
    setEditDescription('');
    setEditSeries('');
    setEditType('vending');
  };

  const handleDelete = (productId: string, productName: string) => {
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      products.splice(productIndex, 1);
      toast.success(`Deleted ${productName} successfully`);
      console.log(`Product ${productId} deleted`);
    }
  };

  const handleAddProduct = () => {
    const newPrice = parseFloat(editPrice);
    const newStock = parseInt(editStock);
    
    if (isNaN(newPrice) || isNaN(newStock) || newPrice <= 0 || newStock < 0) {
      toast.error('Invalid price or stock value');
      return;
    }

    if (!editName.trim() || !editDescription.trim() || !editSeries.trim()) {
      toast.error('All fields are required');
      return;
    }

    const newProduct: Product = {
      id: `${editSeries.toLowerCase()}-${Date.now()}`,
      name: editName.trim(),
      price: newPrice,
      description: editDescription.trim(),
      series: editSeries.trim(),
      type: editType,
      stock: newStock,
      images: ['/placeholder.svg'],
      specs: {
        power: '220V/110V',
        dimensions: 'Standard',
        weight: 'Standard',
        features: ['Standard Features']
      }
    };

    products.push(newProduct);
    toast.success(`Added ${editName} successfully`);
    console.log('New product added:', newProduct);
    
    setShowAddForm(false);
    handleCancel();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Warehouse className="h-5 w-5 text-brand-green" />
            Inventory Management
            <Badge variant="secondary" className="ml-auto bg-brand-green text-black">
              Currency: {currentCurrency.code}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-brand-green hover:bg-brand-green/90 text-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {lowStockProducts.length > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-yellow-500 font-medium">Low Stock Alert</span>
                </div>
                <div className="space-y-1">
                  {lowStockProducts.map(product => (
                    <div key={product.id} className="text-sm text-gray-300">
                      {product.name} - Only {product.stock} left
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showAddForm && (
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">Add New Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Product Name</label>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Product name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Series</label>
                        <Input
                          value={editSeries}
                          onChange={(e) => setEditSeries(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="e.g., T1, S1, X1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                        <Select value={editType} onValueChange={(value: 'vending' | 'claw') => setEditType(value)}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vending">Vending</SelectItem>
                            <SelectItem value="claw">Claw</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Stock</label>
                        <Input
                          value={editStock}
                          onChange={(e) => setEditStock(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Stock"
                          type="number"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Price ({currentCurrency.symbol})</label>
                        <Input
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Price"
                          type="number"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Product description"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={handleAddProduct}
                        className="bg-brand-green hover:bg-brand-green/90 text-black"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Add Product
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddForm(false);
                          handleCancel();
                        }}
                        className="border-gray-600 text-white hover:bg-gray-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="max-h-96 overflow-y-auto space-y-4">
              {filteredProducts.map(product => (
                <div key={product.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                  {editingProduct === product.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Product Name</label>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Product name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Series</label>
                          <Input
                            value={editSeries}
                            onChange={(e) => setEditSeries(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Series"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                          <Select value={editType} onValueChange={(value: 'vending' | 'claw') => setEditType(value)}>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vending">Vending</SelectItem>
                              <SelectItem value="claw">Claw</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Stock</label>
                          <Input
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Stock"
                            type="number"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Price ({currentCurrency.symbol})</label>
                          <Input
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Price"
                            type="number"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <Textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Product description"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(product.id)}
                          className="bg-brand-green hover:bg-brand-green/90 text-black"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save Changes
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          className="border-gray-600 text-white hover:bg-gray-700"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div 
                          className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-brand-green transition-all duration-200"
                          onClick={() => window.open(`/products/${product.id}`, '_blank')}
                        >
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-white">{product.name}</h3>
                            <Badge variant={product.type === 'vending' ? 'default' : 'secondary'} className="text-xs">
                              {product.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{product.series} Series</p>
                          <p className="text-sm text-gray-300 line-clamp-2">{product.description}</p>
                          <div className="flex items-center gap-6 mt-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">Type:</span>
                              <span className="text-sm text-white capitalize">{product.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">Stock:</span>
                              <Badge variant={product.stock > 20 ? "default" : product.stock > 5 ? "secondary" : "destructive"}>
                                {product.stock}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-lg font-semibold text-white">
                          {formatPrice(product.price)}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(product)}
                            className="text-gray-400 hover:text-white hover:bg-gray-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(product.id, product.name)}
                            className="text-gray-400 hover:text-red-500 hover:bg-gray-700"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManagement;
