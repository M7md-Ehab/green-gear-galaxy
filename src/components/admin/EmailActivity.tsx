import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EmailActivity {
  id: string;
  order_code: number;
  email_type: string;
  recipient_email: string;
  subject: string;
  sent_at: string;
  status: string;
}

const EmailActivity = () => {
  const [emails, setEmails] = useState<EmailActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmailActivity();
  }, []);

  const fetchEmailActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('email_activity')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);

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
      shipped: 'Shipped',
      delivered: 'Delivered',
      finished: 'Finished'
    };
    return labels[type] || type;
  };

  const getEmailTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      order_confirmation: 'default',
      admin_notification: 'secondary',
      shipped: 'default',
      delivered: 'default',
      finished: 'default'
    };
    return variants[type] || 'default';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : emails.length === 0 ? (
          <p className="text-center text-gray-400">No email activity yet</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.map((email) => (
                  <TableRow key={email.id}>
                    <TableCell className="font-medium">
                      {email.order_code ? `#${email.order_code}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getEmailTypeBadge(email.email_type)}>
                        {getEmailTypeLabel(email.email_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{email.recipient_email}</TableCell>
                    <TableCell className="text-sm">{email.subject}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(email.sent_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {email.status === 'sent' ? (
                        <div className="flex items-center gap-1 text-green-500">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Sent</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-500">
                          <XCircle className="h-4 w-4" />
                          <span className="text-sm">Failed</span>
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