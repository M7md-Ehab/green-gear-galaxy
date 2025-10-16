import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User, Package, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  user_id: string;
  user_email: string;
  order_code: number;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter an email or order code');
      return;
    }

    setIsLoading(true);
    try {
      // Try to search by order code first (if it's a number)
      const orderCode = parseInt(searchQuery.trim());
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_id,
            quantity,
            price
          )
        `);

      if (!isNaN(orderCode)) {
        query = query.eq('order_code', orderCode);
      } else {
        query = query.eq('user_email', searchQuery.trim());
      }

      const { data: orders, error } = await query;

      if (error) {
        throw error;
      }

      setOrders(orders || []);
      
      if (!orders || orders.length === 0) {
        toast.info('No orders found');
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

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrders(prev => new Set(prev).add(orderId));
    
    try {
      const { error } = await supabase.functions.invoke('update-order-status', {
        body: {
          order_id: orderId,
          status: newStatus,
        },
      });

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      toast.success('Order status updated and customer notified');
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(`Failed to update status: ${error.message}`);
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
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
              placeholder="Enter Email or Order Code"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                <div className="space-y-4 mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Order #{order.order_code}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-brand-green" />
                      <div>
                        <p className="text-sm text-gray-400">Customer Email</p>
                        <p className="font-medium">{order.user_email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-brand-green" />
                      <div>
                        <p className="text-sm text-gray-400">Order Date</p>
                        <p className="text-sm">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-brand-green" />
                      <div>
                        <p className="text-sm text-gray-400">Total</p>
                        <p className="font-medium">${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <Package className="h-4 w-4 text-brand-green mt-1" />
                      <div className="flex-1">
                        <p className="font-medium mb-2">Order Items:</p>
                        {order.order_items?.map((item, index) => (
                          <div key={index} className="text-sm text-gray-300">
                            Product ID: {item.product_id} × {item.quantity} - ${item.price.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-4 border-t border-gray-700">
                      <p className="text-sm text-gray-400">Update Order Status:</p>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusUpdate(order.id, value)}
                        disabled={updatingOrders.has(order.id)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="finished">Finished</SelectItem>
                        </SelectContent>
                      </Select>
                      {updatingOrders.has(order.id) && (
                        <p className="text-xs text-gray-400">Updating and sending notification...</p>
                      )}
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