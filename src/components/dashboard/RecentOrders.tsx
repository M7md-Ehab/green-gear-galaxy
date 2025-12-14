import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Package, Clock, CheckCircle, Truck, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  id: string;
  product_id: string | null;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_code: number;
  status: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', label: 'Pending' },
  processing: { icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'On the Way' },
  delivered: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Delivered' },
  postponed: { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10', label: 'Postponed' },
  declined: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Declined' },
  cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Cancelled' },
  finished: { icon: CheckCircle, color: 'text-brand-green', bg: 'bg-brand-green/10', label: 'Finished' },
};

const RecentOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            order_code,
            status,
            total,
            created_at,
            order_items!order_items_order_id_fkey (
              id,
              product_id,
              quantity,
              price
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status?.toLowerCase()] || statusConfig.pending;
  };

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-green mx-auto" />
          <p className="text-gray-400 mt-2">Loading orders...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-brand-green flex items-center gap-2">
          <Package className="h-5 w-5" />
          Recent Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-gray-400 mb-4">No recent orders</p>
            <Button
              onClick={() => navigate('/products')}
              variant="outline"
              className="border-gray-600 text-white bg-gray-800 hover:bg-gray-700"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getStatusConfig(order.status || 'pending');
              const StatusIcon = statusInfo.icon;
              const itemCount = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
              
              return (
                <div
                  key={order.id}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-white font-semibold">
                          Order #{order.order_code}
                        </span>
                        <Badge className={`${statusInfo.bg} ${statusInfo.color} border-0`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{formatDate(order.created_at)}</span>
                        <span>•</span>
                        <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-brand-green font-bold text-lg">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
