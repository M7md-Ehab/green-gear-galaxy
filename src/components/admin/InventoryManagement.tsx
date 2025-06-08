
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Warehouse, Search, Package, AlertTriangle } from 'lucide-react';
import { products } from '@/data/products';

const InventoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.series.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(product => product.stock < 10);

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Warehouse className="h-5 w-5 text-brand-green" />
            Inventory Management
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
                className="pl-10 bg-gray-800 border-gray-600 text-white"
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
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-brand-green" />
                    <div>
                      <p className="font-medium text-white">{product.name}</p>
                      <p className="text-sm text-gray-400">{product.series}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={product.stock > 20 ? "default" : product.stock > 5 ? "secondary" : "destructive"}>
                      {product.stock} units
                    </Badge>
                    <span className="text-sm text-gray-400">${product.price.toLocaleString()}</span>
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
