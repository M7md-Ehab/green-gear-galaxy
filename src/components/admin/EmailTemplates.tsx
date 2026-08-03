import { useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EMAIL_TEMPLATES, type EmailMode } from '@/lib/email-preview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send, Sun, Moon, Loader2 } from 'lucide-react';

const MODES: { mode: EmailMode; label: string; icon: typeof Sun }[] = [
  { mode: 'light', label: 'White mode', icon: Sun },
  { mode: 'dark', label: 'Dark mode', icon: Moon },
];

const EmailTemplates = () => {
  const [activeId, setActiveId] = useState(EMAIL_TEMPLATES[0].id);
  const [values, setValues] = useState<Record<string, Record<string, string>>>(() =>
    Object.fromEntries(EMAIL_TEMPLATES.map((t) => [t.id, { ...t.defaults }])),
  );
  const [recipients, setRecipients] = useState<Record<string, string>>({});
  const [sendMode, setSendMode] = useState<Record<string, EmailMode>>({});
  const [sending, setSending] = useState<string | null>(null);

  const template = useMemo(
    () => EMAIL_TEMPLATES.find((t) => t.id === activeId) ?? EMAIL_TEMPLATES[0],
    [activeId],
  );
  const data = values[template.id];

  const setField = (key: string, value: string) =>
    setValues((prev) => ({ ...prev, [template.id]: { ...prev[template.id], [key]: value } }));

  const handleSend = async () => {
    const to = (recipients[template.id] || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      toast.error('Enter a valid recipient email address');
      return;
    }
    const mode = sendMode[template.id] || 'light';
    setSending(template.id);
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject: template.subject(data),
          html: template.render(data, mode),
        },
      });
      if (error) throw error;
      toast.success(`"${template.name}" sent to ${to}`);
    } catch (err: any) {
      console.error('Send email failed:', err);
      toast.error(err?.message || 'Failed to send email');
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Mail className="h-5 w-5 text-brand-green" />
            Email templates
          </CardTitle>
          <p className="text-sm text-gray-400">
            Preview every customer email in white and dark mode with sample data, then send a real
            copy from any category.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeId} onValueChange={setActiveId}>
            <TabsList className="bg-transparent border-0 p-0 h-auto flex flex-wrap gap-2">
              {EMAIL_TEMPLATES.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="data-[state=active]:bg-brand-green data-[state=active]:text-black data-[state=inactive]:bg-gray-800/50 data-[state=inactive]:text-gray-300 px-4 py-2 rounded-lg"
                >
                  {t.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {EMAIL_TEMPLATES.map((t) => (
              <TabsContent key={t.id} value={t.id} className="mt-6 space-y-6">
                <p className="text-sm text-gray-400">{t.description}</p>

                {/* Sample data */}
                <div className="grid gap-4 md:grid-cols-2">
                  {t.fields.map((f) => (
                    <div key={f.key} className="space-y-2">
                      <Label className="text-gray-300">{f.label}</Label>
                      {f.type === 'textarea' ? (
                        <Textarea
                          value={data[f.key] ?? ''}
                          onChange={(e) => setField(f.key, e.target.value)}
                          className="bg-gray-950 border-gray-800 text-white"
                          rows={3}
                        />
                      ) : f.type === 'select' ? (
                        <Select value={data[f.key]} onValueChange={(val) => setField(f.key, val)}>
                          <SelectTrigger className="bg-gray-950 border-gray-800 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-800 text-white">
                            {(f.options || []).map((o) => (
                              <SelectItem key={o} value={o} className="capitalize">
                                {o}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={data[f.key] ?? ''}
                          onChange={(e) => setField(f.key, e.target.value)}
                          className="bg-gray-950 border-gray-800 text-white"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Send */}
                <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-4 space-y-3">
                  <Label className="text-gray-300">Send this email</Label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="email"
                      placeholder="recipient@example.com"
                      value={recipients[t.id] || ''}
                      onChange={(e) =>
                        setRecipients((prev) => ({ ...prev, [t.id]: e.target.value }))
                      }
                      className="bg-gray-900 border-gray-800 text-white sm:max-w-xs"
                    />
                    <Select
                      value={sendMode[t.id] || 'light'}
                      onValueChange={(val) =>
                        setSendMode((prev) => ({ ...prev, [t.id]: val as EmailMode }))
                      }
                    >
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
                      disabled={sending === t.id}
                      className="bg-brand-green text-black hover:bg-brand-green/90"
                    >
                      {sending === t.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Send email
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Subject: <span className="text-gray-300">{t.subject(data)}</span>
                  </p>
                </div>

                {/* Previews */}
                <div className="grid gap-6 xl:grid-cols-2">
                  {MODES.map(({ mode, label, icon: Icon }) => (
                    <div key={mode} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Icon className="h-4 w-4 text-brand-green" />
                        {label}
                      </div>
                      <div className="rounded-lg overflow-hidden border border-gray-800 bg-white">
                        <iframe
                          title={`${t.name} ${label}`}
                          srcDoc={t.render(data, mode)}
                          className="w-full h-[760px] border-0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTemplates;
