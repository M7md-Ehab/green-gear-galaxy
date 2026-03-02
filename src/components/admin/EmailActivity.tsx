import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface EmailActivityItem {
  id: string;
  order_code: number;
  email_type: string;
  recipient_email: string;
  subject: string;
  sent_at: string;
  status: string;
}

const EmailActivity = () => {
  const [emails, setEmails] = useState<EmailActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchEmailActivity(); }, []);

  const fetchEmailActivity = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('email_activity').select('*').order('sent_at', { ascending: false }).limit(100);
      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error('Error fetching email activity:', error);
      toast.error('Failed to load email activity');
    } finally {
      setIsLoading(false);
    }
  };

  const getEmailTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      order_confirmation: 'Order Confirmation',
      admin_notification: 'Admin Notification',
      status_pending: 'Status: Pending',
      status_processing: 'Status: Processing',
      status_shipped: 'Status: Shipped',
      status_delivered: 'Status: Delivered',
      status_postponed: 'Status: Postponed',
      status_declined: 'Status: Declined',
      status_cancelled: 'Status: Cancelled',
      status_finished: 'Status: Finished',
      feedback_pending: 'Feedback: Pending',
      feedback_reviewed: 'Feedback: Reviewed',
      feedback_resolved: 'Feedback: Resolved',
      otp_signup: 'OTP: Sign Up',
      otp_login: 'OTP: Login',
      otp_email_change: 'OTP: Email Change',
      otp_verify_identity: 'OTP: Verify Identity',
    };
    return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getEmailTypeBadgeColor = (type: string) => {
    if (type.startsWith('otp_')) return 'bg-purple-500/20 text-purple-400';
    if (type.startsWith('feedback_')) return 'bg-blue-500/20 text-blue-400';
    if (type.startsWith('status_')) return 'bg-amber-500/20 text-amber-400';
    if (type === 'order_confirmation') return 'bg-green-500/20 text-green-400';
    if (type === 'admin_notification') return 'bg-gray-500/20 text-gray-400';
    return '';
  };

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Mail className="h-5 w-5 text-brand-green" /> Email Activity Log
            <Badge variant="secondary" className="ml-2">{emails.length}</Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchEmailActivity} className="text-gray-400 hover:text-white">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-gray-400 py-8">Loading...</p>
        ) : emails.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No email activity yet</p>
        ) : (
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-400">Ref</TableHead>
                  <TableHead className="text-gray-400">Type</TableHead>
                  <TableHead className="text-gray-400">Recipient</TableHead>
                  <TableHead className="text-gray-400">Subject</TableHead>
                  <TableHead className="text-gray-400">Sent At</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.map((email) => (
                  <TableRow key={email.id} className="border-gray-700/50">
                    <TableCell className="font-medium text-white">
                      {email.order_code > 0 ? `#${email.order_code}` : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getEmailTypeBadgeColor(email.email_type)} border-0 text-xs`}>
                        {getEmailTypeLabel(email.email_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-300">{email.recipient_email}</TableCell>
                    <TableCell className="text-sm text-gray-300 max-w-[200px] truncate">{email.subject}</TableCell>
                    <TableCell className="text-sm text-gray-400">
                      {new Date(email.sent_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell>
                      {email.status === 'sent' ? (
                        <div className="flex items-center gap-1 text-green-500">
                          <CheckCircle className="h-4 w-4" /><span className="text-sm">Sent</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-500">
                          <XCircle className="h-4 w-4" /><span className="text-sm">Failed</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailActivity;
