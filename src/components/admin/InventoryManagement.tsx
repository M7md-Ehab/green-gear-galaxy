
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Warehouse, Search, Package, AlertTriangle, Edit, Save, X } from 'lucide-react';
import { products } from '@/data/products';
import { useCurrency } from '@/hooks/use-currency';
import { toast } from 'sonner';

const InventoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const { formatPrice, currentCurrency } = useCurrency();
  
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.series.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(product => product.stock < 10);

  const handleEdit = (productId: string, currentPrice: number, currentStock: number) => {
    setEditingProduct(productId);
    setEditPrice(currentPrice.toString());
    setEditStock(currentStock.toString());
  };

  const handleSave = (productId: string) => {
    const newPrice = parseFloat(editPrice);
    const newStock = parseInt(editStock);
    
    if (isNaN(newPrice) || isNaN(newStock) || newPrice <= 0 || newStock < 0) {
      toast.error('Invalid price or stock value');
      return;
    }

    // Update the product in the products array
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      products[productIndex].price = newPrice;
      products[productIndex].stock = newStock;
      
      toast.success(`Updated ${products[productIndex].name} successfully`);
      console.log(`Product ${productId} updated: price=${newPrice} ${currentCurrency.code}, stock=${newStock}`);
    }
    
    setEditingProduct(null);
    setEditPrice('');
    setEditStock('');
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setEditPrice('');
    setEditStock('');
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
              />
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

            <div className="max-h-96 overflow-y-auto space-y-3">
              {filteredProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-brand-green" />
                    <div>
                      <p className="font-medium text-white">{product.name}</p>
                      <p className="text-sm text-gray-400">{product.series}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {editingProduct === product.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editStock}
                          onChange={(e) => setEditStock(e.target.value)}
                          className="w-16 h-8 text-xs bg-gray-700 border-gray-600 text-white"
                          placeholder="Stock"
                          type="number"
                          min="0"
                        />
                        <div className="relative">
                          <Input
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-24 h-8 text-xs bg-gray-700 border-gray-600 text-white pl-6"
                            placeholder="Price"
                            type="number"
                            min="0"
                            step="0.01"
                          />
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                            {currentCurrency.symbol}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSave(product.id)}
                          className="h-8 px-2 bg-brand-green hover:bg-brand-green/90 text-black"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          className="h-8 px-2 border-gray-600 text-white hover:bg-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Badge variant={product.stock > 20 ? "default" : product.stock > 5 ? "secondary" : "destructive"}>
                          {product.stock} units
                        </Badge>
                        <span className="text-sm text-white font-medium">
                          {formatPrice(product.price)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(product.id, product.price, product.stock)}
                          className="h-8 px-2 text-gray-400 hover:text-white hover:bg-gray-700"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
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
