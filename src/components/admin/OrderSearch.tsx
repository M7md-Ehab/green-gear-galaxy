import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, User, Package, Calendar, DollarSign, MapPin, Phone, CreditCard, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  user_id: string | null;
  user_email: string;
  customer_phone: string | null;
  customer_address: string | null;
  customer_city: string | null;
  payment_method: string | null;
  notes: string | null;
  order_code: number;
  total: number;
  status: string;
  created_at: string;
  order_items: Array<{
    product_id: string | null;
    quantity: number;
    price: number;
  }> | null;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'processing', label: 'Processing', color: 'bg-blue-500' },
  { value: 'shipped', label: 'On the Way', color: 'bg-purple-500' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-500' },
  { value: 'postponed', label: 'Postponed', color: 'bg-orange-500' },
  { value: 'declined', label: 'Declined', color: 'bg-red-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-500' },
  { value: 'finished', label: 'Finished', color: 'bg-emerald-600' },
];

const getStatusBadge = (status: string) => {
  const statusInfo = statusOptions.find(s => s.value === status) || statusOptions[0];
  return (
    <Badge className={`${statusInfo.color} text-white`}>
      {statusInfo.label}
    </Badge>
  );
};

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
      const orderCode = parseInt(searchQuery.trim());
      let query = supabase
        .from('orders')
        .select(`
          id,
          user_id,
          user_email,
          customer_phone,
          customer_address,
          customer_city,
          payment_method,
          notes,
          order_code,
          total,
          status,
          created_at,
          order_items!order_items_order_id_fkey (
            product_id,
            quantity,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (!isNaN(orderCode)) {
        query = query.eq('order_code', orderCode);
      } else {
        query = query.eq('user_email', searchQuery.trim());
      }

      const { data: orders, error } = await query;

      if (error) throw error;

      setOrders((orders as unknown as Order[]) || []);
      
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
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Search className="h-5 w-5 text-brand-green" />
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
              className="flex-1 bg-gray-800 border-gray-600 text-white"
            />
            <Button 
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-brand-green hover:bg-brand-green/90 text-black"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search Orders'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {orders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Search Results ({orders.length} orders)</h3>
          {orders.map((order) => (
            <Card key={order.id} className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-bold text-white">Order #{order.order_code}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Customer Info */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-brand-green uppercase tracking-wider">Customer Details</h4>
                    
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 text-brand-green mt-1" />
                      <div>
                        <p className="text-xs text-gray-400">Email</p>
                        <p className="text-white font-medium">{order.user_email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-brand-green mt-1" />
                      <div>
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="text-white font-medium">{order.customer_phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Shipping Info */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-brand-green uppercase tracking-wider">Shipping Details</h4>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-brand-green mt-1" />
                      <div>
                        <p className="text-xs text-gray-400">Address</p>
                        <p className="text-white font-medium">{order.customer_address || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-brand-green mt-1" />
                      <div>
                        <p className="text-xs text-gray-400">City</p>
                        <p className="text-white font-medium">{order.customer_city || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-4 w-4 text-brand-green mt-1" />
                      <div>
                        <p className="text-xs text-gray-400">Payment Method</p>
                        <p className="text-white font-medium capitalize">
                          {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-brand-green uppercase tracking-wider">Order Items</h4>
                    
                    <div className="flex items-start gap-3">
                      <Package className="h-4 w-4 text-brand-green mt-1" />
                      <div className="flex-1">
                        {order.order_items?.map((item, index) => (
                          <div key={index} className="text-sm text-gray-300 mb-1">
                            × {item.quantity} — ${item.price.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-4 w-4 text-brand-green mt-1" />
                      <div>
                        <p className="text-xs text-gray-400">Total</p>
                        <p className="text-white text-xl font-bold">${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Notes */}
                {order.notes && (
                  <div className="mt-6 pt-4 border-t border-gray-700">
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 text-brand-green mt-1" />
                      <div>
                        <p className="text-xs text-gray-400">Order Notes</p>
                        <p className="text-gray-300">{order.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Status Update */}
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-400">Update Status:</p>
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusUpdate(order.id, value)}
                      disabled={updatingOrders.has(order.id)}
                    >
                      <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {updatingOrders.has(order.id) && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Updating & sending notification...</span>
                      </div>
                    )}
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
