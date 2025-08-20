import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, User, Package, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
  order_items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
}

const OrderSearch = () => {
  const [searchUserId, setSearchUserId] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchUserId.trim()) {
      toast.error('Please enter a user ID');
      return;
    }

    setIsLoading(true);
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_id,
            quantity,
            price
          )
        `)
        .eq('user_id', searchUserId.trim());

      if (error) {
        throw error;
      }

      setOrders(orders || []);
      
      if (!orders || orders.length === 0) {
        toast.info('No orders found for this user ID');
      } else {
        toast.success(`Found ${orders.length} order(s)`);
      }
    } catch (error) {
      console.error('Error searching orders:', error);
      toast.error('Failed to search orders');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Order Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter User ID"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-brand-green hover:bg-brand-green/90 text-black"
            >
              {isLoading ? 'Searching...' : 'Search Orders'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {orders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Search Results ({orders.length} orders)</h3>
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-brand-green" />
                      <div>
                        <p className="font-medium">User ID: {order.user_id}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-brand-green" />
                      <p className="text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-brand-green" />
                      <p className="font-medium">${(order.total / 100).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <Package className="h-4 w-4 text-brand-green mt-1" />
                      <div className="flex-1">
                        <p className="font-medium mb-2">Order Items:</p>
                        {order.order_items?.map((item, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            Product ID: {item.product_id} × {item.quantity} - ${(item.price / 100).toFixed(2)}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                      <span className="text-sm text-gray-500">Order ID: {order.id}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderSearch;