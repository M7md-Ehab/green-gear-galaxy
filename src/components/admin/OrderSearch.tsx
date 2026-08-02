import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, User, Package, DollarSign, MapPin, Phone, CreditCard, FileText, Loader2, RefreshCw, Hash, Mail, MailCheck, MailX, MailWarning, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  user_id: string | null;
  user_email: string;
  customer_name: string | null;
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

type MailStatus = 'sent' | 'failed' | 'not_sent';

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

const getMailBadge = (mail: MailStatus, count: number) => {
  if (mail === 'sent') {
    return (
      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border gap-1.5">
        <MailCheck className="h-3.5 w-3.5" /> Mail Sent{count > 1 ? ` (${count})` : ''}
      </Badge>
    );
  }
  if (mail === 'failed') {
    return (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 border gap-1.5">
        <MailX className="h-3.5 w-3.5" /> Mail Failed
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 border gap-1.5">
      <MailWarning className="h-3.5 w-3.5" /> No Mail Sent
    </Badge>
  );
};

const OrderSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [mailInfo, setMailInfo] = useState<Record<number, { status: MailStatus; count: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());

  const orderSelect = `
    id,
    user_id,
    user_email,
    customer_name,
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
  `;

  const loadMailInfo = useCallback(async (codes: number[]) => {
    if (codes.length === 0) {
      setMailInfo({});
      return;
    }
    const { data, error } = await supabase
      .from('email_activity')
      .select('order_code, status')
      .in('order_code', codes);
    if (error) {
      console.error('Error loading email activity:', error);
      return;
    }
    const map: Record<number, { status: MailStatus; count: number }> = {};
    (data || []).forEach((row: any) => {
      const current = map[row.order_code] || { status: 'not_sent' as MailStatus, count: 0 };
      const failed = row.status !== 'sent';
      map[row.order_code] = {
        count: current.count + 1,
        status: current.status === 'failed' || failed ? 'failed' : 'sent',
      };
    });
    setMailInfo(map);
  }, []);

  const applyOrders = useCallback(async (list: Order[]) => {
    setOrders(list);
    await loadMailInfo(list.map(o => o.order_code).filter(c => c !== null && c !== undefined));
  }, [loadMailInfo]);

  const fetchAllOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(orderSelect)
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      await applyOrders((data as unknown as Order[]) || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [applyOrders]);

  useEffect(() => { fetchAllOrders(); }, [fetchAllOrders]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchAllOrders();
      return;
    }

    setIsLoading(true);
    try {
      const orderCode = parseInt(searchQuery.trim());
      let query = supabase
        .from('orders')
        .select(orderSelect)
        .order('created_at', { ascending: false });

      if (!isNaN(orderCode)) {
        query = query.eq('order_code', orderCode);
      } else {
        query = query.ilike('user_email', `%${searchQuery.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const list = (data as unknown as Order[]) || [];
      await applyOrders(list);

      if (list.length === 0) {
        toast.info('No orders found');
      } else {
        toast.success(`Found ${list.length} order(s)`);
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
      await loadMailInfo(orders.map(o => o.order_code));

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

  const mailFor = (code: number): { status: MailStatus; count: number } =>
    mailInfo[code] || { status: 'not_sent', count: 0 };

  const counts = {
    total: orders.length,
    sent: orders.filter(o => mailFor(o.order_code).status === 'sent').length,
    failed: orders.filter(o => mailFor(o.order_code).status === 'failed').length,
    none: orders.filter(o => mailFor(o.order_code).status === 'not_sent').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', count: counts.total, color: 'text-white', icon: ShoppingCart, iconColor: 'text-brand-green' },
          { label: 'Mail Sent', count: counts.sent, color: 'text-emerald-400', icon: MailCheck, iconColor: 'text-emerald-400' },
          { label: 'Mail Failed', count: counts.failed, color: 'text-red-400', icon: MailX, iconColor: 'text-red-400' },
          { label: 'No Mail', count: counts.none, color: 'text-amber-400', icon: MailWarning, iconColor: 'text-amber-400' },
        ].map((stat, i) => (
          <Card key={i} className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.iconColor} opacity-50`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Search className="h-5 w-5 text-brand-green" />
              Orders
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchAllOrders} className="text-gray-400 hover:text-white">
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Filter by Email or Order Code (empty = all orders)"
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
                  Loading...
                </>
              ) : (
                'Search Orders'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="text-center py-12 text-gray-400">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Orders ({orders.length})</h3>
          {orders.map((order) => {
            const mail = mailFor(order.order_code);
            return (
            <Card key={order.id} className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-1">
                      <Hash className="h-5 w-5 text-brand-green" />
                      {order.order_code ?? '—'}
                    </h3>
                    {getStatusBadge(order.status)}
                    {getMailBadge(mail.status, mail.count)}
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
                      <Hash className="h-4 w-4 text-brand-green mt-1" />
                      <div>
                        <p className="text-xs text-gray-400">Order Code</p>
                        <p className="text-white font-medium">{order.order_code ?? 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 text-brand-green mt-1" />
                      <div>
                        <p className="text-xs text-gray-400">Name</p>
                        <p className="text-white font-medium">{order.customer_name || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-brand-green mt-1" />
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
                  <div className="flex items-center gap-4 flex-wrap">
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
          );})}
        </div>
      )}
    </div>
  );
};

export default OrderSearch;
