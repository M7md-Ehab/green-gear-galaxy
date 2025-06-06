
import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, User, Package, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  createdAt: any;
  shippingAddress: any;
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
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('userId', '==', searchUserId.trim()));
      const querySnapshot = await getDocs(q);
      
      const orderData: Order[] = [];
      querySnapshot.forEach((doc) => {
        orderData.push({ id: doc.id, ...doc.data() } as Order);
      });

      setOrders(orderData);
      
      if (orderData.length === 0) {
        toast.info('No orders found for this user ID');
      } else {
        toast.success(`Found ${orderData.length} order(s)`);
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
                        <p className="font-medium">{order.userName}</p>
                        <p className="text-sm text-gray-600">{order.userEmail}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-brand-green" />
                      <p className="text-sm">
                        {order.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-brand-green" />
                      <p className="font-medium">${order.total?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <Package className="h-4 w-4 text-brand-green mt-1" />
                      <div className="flex-1">
                        <p className="font-medium mb-2">Products:</p>
                        {order.products?.map((product, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {product.name} × {product.quantity} - ${product.price?.toFixed(2)}
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
