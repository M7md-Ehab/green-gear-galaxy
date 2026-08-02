import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, User, Mail, Clock, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    setLoading(true);
    try {
      const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
      if (error) { console.error('Error fetching feedback:', error); toast.error('Failed to load feedback'); return; }
      setFeedbacks(data || []);
    } catch (error) { console.error('Error:', error); toast.error('Failed to load feedback'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFeedbacks(); }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase.from('feedback').update({ status }).eq('id', id);
      if (error) throw error;

      const feedback = feedbacks.find(f => f.id === id);
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status } : f));
      
      // Send email notification on status change
      if (feedback) {
        try {
          await supabase.functions.invoke('send-email', {
            body: {
              to: feedback.email,
              subject: `Feedback Update: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
              title: 'Your feedback status was updated',
              eyebrow: 'Feedback update',
              subtitle: `Your feedback is now marked as "${status}".`,
              html: `
                <p style="margin:0 0 20px;color:#4A4A4A;font-size:15px;line-height:24px;">Hi <strong style="color:#111111;">${feedback.name}</strong>,</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #E6E6E6;border-left:3px solid #00FF84;background-color:#FAFAFA;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <p style="margin:0;color:#8A8A8A;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Status</p>
                      <p style="margin:6px 0 0;color:#111111;font-size:18px;font-weight:700;text-transform:capitalize;">${status}</p>
                    </td>
                  </tr>
                </table>
                <div style="height:20px;"></div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #E6E6E6;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <p style="margin:0 0 8px;color:#111111;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Your message</p>
                      <p style="margin:0;color:#4A4A4A;font-size:14px;line-height:22px;">${feedback.message}</p>
                    </td>
                  </tr>
                </table>
                <div style="height:20px;"></div>
                <p style="margin:0;color:#4A4A4A;font-size:14px;line-height:22px;">Thank you for helping us improve Vlitrix.</p>
              `,
            },
          });
          
          // Log the email
          await supabase.from('email_activity').insert({
            order_code: 0,
            email_type: `feedback_${status}`,
            recipient_email: feedback.email,
            subject: `Feedback Update: ${status}`,
            status: 'sent',
          });
        } catch (emailErr) {
          console.error('Failed to send feedback email:', emailErr);
        }
      }
      
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
      case 'pending': return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 border">Pending</Badge>;
      case 'reviewed': return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 border">Reviewed</Badge>;
      case 'resolved': return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border">Resolved</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const counts = {
    total: feedbacks.length,
    pending: feedbacks.filter(f => f.status === 'pending' || !f.status).length,
    reviewed: feedbacks.filter(f => f.status === 'reviewed').length,
    resolved: feedbacks.filter(f => f.status === 'resolved').length,
  };

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', count: counts.total, color: 'text-white', icon: MessageSquare, iconColor: 'text-brand-green' },
          { label: 'Pending', count: counts.pending, color: 'text-amber-400', icon: Clock, iconColor: 'text-amber-400' },
          { label: 'Reviewed', count: counts.reviewed, color: 'text-blue-400', icon: User, iconColor: 'text-blue-400' },
          { label: 'Resolved', count: counts.resolved, color: 'text-emerald-400', icon: MessageSquare, iconColor: 'text-emerald-400' },
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

      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-800">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageSquare className="h-5 w-5 text-brand-green" /> User Feedback
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchFeedbacks} className="text-gray-400 hover:text-white">
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {feedbacks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No feedback submissions yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="p-5 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-green/30 to-emerald-600/30 flex items-center justify-center">
                        <User className="h-6 w-6 text-brand-green" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-lg">{feedback.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Mail className="h-3.5 w-3.5" /><span>{feedback.email}</span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(feedback.status || 'pending')}
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{feedback.message}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {new Date(feedback.created_at).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Status:</span>
                      <Select value={feedback.status || 'pending'} onValueChange={(value) => updateStatus(feedback.id, value)} disabled={updatingId === feedback.id}>
                        <SelectTrigger className="w-32 h-9 bg-gray-700/50 border-gray-600 text-white text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="pending" className="text-white hover:bg-gray-700">Pending</SelectItem>
                          <SelectItem value="reviewed" className="text-white hover:bg-gray-700">Reviewed</SelectItem>
                          <SelectItem value="resolved" className="text-white hover:bg-gray-700">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackManagement;
