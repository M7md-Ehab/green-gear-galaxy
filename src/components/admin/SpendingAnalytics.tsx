import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, DollarSign } from 'lucide-react';

type TimeRange = 'today' | 'week' | 'month' | 'all';

export default function SpendingAnalytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const getDateFilter = () => {
    const now = new Date();
    switch (timeRange) {
      case 'today':
        const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        return startOfDay;
      case 'week':
        const startOfWeek = new Date(now.setDate(now.getDate() - 7)).toISOString();
        return startOfWeek;
      case 'month':
        const startOfMonth = new Date(now.setDate(now.getDate() - 30)).toISOString();
        return startOfMonth;
      case 'all':
        return null;
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const dateFilter = getDateFilter();
      
      let query = supabase
        .from('orders')
        .select('total, created_at');

      if (dateFilter) {
        query = query.gte('created_at', dateFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const total = data.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
        setTotalSpent(total);
        setOrderCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-green" />
              Spending Analytics
            </CardTitle>
            <CardDescription>Track total revenue over time</CardDescription>
          </div>
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg">
              <DollarSign className="h-8 w-8 text-brand-green" />
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-white">${totalSpent.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-brand-green" />
              <div>
                <p className="text-sm text-gray-400">Orders</p>
                <p className="text-2xl font-bold text-white">{orderCount}</p>
              </div>
            </div>
            {orderCount > 0 && (
              <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg">
                <DollarSign className="h-8 w-8 text-brand-green" />
                <div>
                  <p className="text-sm text-gray-400">Average Order Value</p>
                  <p className="text-2xl font-bold text-white">
                    ${(totalSpent / orderCount).toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
