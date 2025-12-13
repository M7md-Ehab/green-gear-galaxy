import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, User, Mail, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Feedback {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
  user_id: string | null;
}

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setFeedbacks(prev => 
        prev.map(f => f.id === id ? { ...f, status } : f)
      );
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case 'reviewed':
        return <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">Reviewed</Badge>;
      case 'resolved':
        return <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageSquare className="h-5 w-5 text-brand-green" />
          User Feedback
          <Badge variant="secondary" className="ml-auto bg-brand-green/20 text-brand-green">
            {feedbacks.length} Total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {feedbacks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No feedback submissions yet</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {feedbacks.map((feedback) => (
              <div 
                key={feedback.id} 
                className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-green/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-brand-green" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{feedback.name}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Mail className="h-3 w-3" />
                        {feedback.email}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(feedback.status || 'pending')}
                </div>
                
                <p className="text-gray-300 text-sm bg-gray-900/50 p-3 rounded-md">
                  {feedback.message}
                </p>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {new Date(feedback.created_at).toLocaleString()}
                  </div>
                  
                  <Select 
                    value={feedback.status || 'pending'} 
                    onValueChange={(value) => updateStatus(feedback.id, value)}
                    disabled={updatingId === feedback.id}
                  >
                    <SelectTrigger className="w-32 h-8 bg-gray-700 border-gray-600 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="pending" className="text-white">Pending</SelectItem>
                      <SelectItem value="reviewed" className="text-white">Reviewed</SelectItem>
                      <SelectItem value="resolved" className="text-white">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackManagement;
