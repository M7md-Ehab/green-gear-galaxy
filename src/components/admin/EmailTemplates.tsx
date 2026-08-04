import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EMAIL_TEMPLATES, type EmailMode } from '@/lib/email-preview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send, Sun, Moon, Loader2 } from 'lucide-react';

const MODES: { mode: EmailMode; label: string; icon: typeof Sun }[] = [
  { mode: 'light', label: 'White mode', icon: Sun },
  { mode: 'dark', label: 'Dark mode', icon: Moon },
];

interface OrderRow {
  id: string;
  order_code: number;
  customer_name: string | null;
  user_email: string;
  status: string | null;
  customer_address: string | null;
  customer_city: string | null;
  customer_phone: string | null;
  payment_method: string | null;
}

const NO_ORDER = 'none';

/**
 * Maps a selected order onto any template's field keys.
 * New templates work automatically as long as they reuse these keys.
 */
const valuesFromOrder = (
  defaults: Record<string, string>,
  order: OrderRow | null,
): Record<string, string> => {
  if (!order) return { ...defaults };
  const mapped: Record<string, string> = {
    customerName: order.customer_name || order.user_email?.split('@')[0] || 'Customer',
    orderCode: String(order.order_code ?? ''),
    status: order.status || 'pending',
    address: order.customer_address || '—',
    city: order.customer_city || '—',
    phone: order.customer_phone || '—',
    payment: order.payment_method === 'cod' ? 'Cash on delivery' : order.payment_method || '—',
  };
  const out = { ...defaults };
  Object.keys(defaults).forEach((k) => {
    if (mapped[k] !== undefined) out[k] = mapped[k];
  });
  return out;
};

const EmailTemplates = () => {
  const [templateId, setTemplateId] = useState(EMAIL_TEMPLATES[0].id);
  const [orderId, setOrderId] = useState<string>(NO_ORDER);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [recipient, setRecipient] = useState('');
  const [mode, setMode] = useState<EmailMode>('light');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(
          'id, order_code, customer_name, user_email, status, customer_address, customer_city, customer_phone, payment_method',
        )
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) {
        console.error('Failed to load orders:', error);
        return;
      }
      setOrders((data || []) as OrderRow[]);
    })();
  }, []);

  const template = useMemo(
    () => EMAIL_TEMPLATES.find((t) => t.id === templateId) ?? EMAIL_TEMPLATES[0],
    [templateId],
  );
  const order = useMemo(
    () => orders.find((o) => o.id === orderId) ?? null,
    [orders, orderId],
  );

  const data = useMemo(() => valuesFromOrder(template.defaults, order), [template, order]);

  const handleOrderChange = (value: string) => {
    setOrderId(value);
    const picked = orders.find((o) => o.id === value);
    if (picked?.user_email) setRecipient(picked.user_email);
  };

  const handleSend = async () => {
    const to = recipient.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      toast.error('Enter a valid recipient email address');
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: { to, subject: template.subject(data), html: template.render(data, mode) },
      });
      if (error) throw error;
      toast.success(`"${template.name}" sent to ${to}`);
    } catch (err: any) {
      console.error('Send email failed:', err);
      toast.error(err?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Mail className="h-5 w-5 text-brand-green" />
            Send a template email
          </CardTitle>
          <p className="text-sm text-gray-400">
            Pick a predefined email, choose the order it belongs to, and send it. Content is
            generated automatically from the order and customer details — nothing to write.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-gray-300">Email template</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger className="bg-gray-950 border-gray-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                  {EMAIL_TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">{template.description}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Order (optional)</Label>
              <Select value={orderId} onValueChange={handleOrderChange}>
                <SelectTrigger className="bg-gray-950 border-gray-800 text-white">
                  <SelectValue placeholder="Select an order" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white max-h-72">
                  <SelectItem value={NO_ORDER}>No order — use sample data</SelectItem>
                  {orders.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      #{o.order_code} — {o.customer_name || o.user_email} ({o.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Recipient email</Label>
              <Input
                type="email"
                placeholder="customer@example.com"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="bg-gray-950 border-gray-800 text-white"
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-4 space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(data).map(([k, v]) => (
                <p key={k} className="text-xs text-gray-500 truncate">
                  {k}: <span className="text-gray-300">{v}</span>
                </p>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Subject: <span className="text-gray-300">{template.subject(data)}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={mode} onValueChange={(v) => setMode(v as EmailMode)}>
                <SelectTrigger className="bg-gray-900 border-gray-800 text-white sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                  <SelectItem value="light">White mode</SelectItem>
                  <SelectItem value="dark">Dark mode</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleSend}
                disabled={sending}
                className="bg-brand-green text-black hover:bg-brand-green/90"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send email
              </Button>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {MODES.map(({ mode: m, label, icon: Icon }) => (
              <div key={m} className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Icon className="h-4 w-4 text-brand-green" />
                  {label}
                </div>
                <div className="rounded-lg overflow-hidden border border-gray-800 bg-white">
                  <iframe
                    title={`${template.name} ${label}`}
                    srcDoc={template.render(data, m)}
                    className="w-full h-[760px] border-0"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTemplates;
