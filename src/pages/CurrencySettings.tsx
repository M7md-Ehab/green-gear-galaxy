import { useState, useEffect } from 'react';
import { useCurrency } from '@/hooks/use-currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';

const CurrencySettings = () => {
  const { apiToken, setApiToken } = useCurrency();
  const [token, setToken] = useState(apiToken || '');

  useEffect(() => {
    // Set the CurrencyFreaks API key
    if (!apiToken) {
      setApiToken('f2e1d3e578364325852110aa95b5d3f3');
    }
  }, [apiToken, setApiToken]);

  const handleSave = () => {
    setApiToken(token);
    toast.success('Currency API key updated successfully');
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Currency Settings</CardTitle>
              <CardDescription>
                Configure your CurrencyFreaks API key for live exchange rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-token">CurrencyFreaks API Key</Label>
                <Input
                  id="api-token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your API key"
                />
                <p className="text-sm text-gray-400">
                  Get your API key from{' '}
                  <a
                    href="https://billing.currencyfreaks.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-green hover:underline"
                  >
                    CurrencyFreaks
                  </a>
                </p>
              </div>
              <Button onClick={handleSave} className="bg-brand-green hover:bg-brand-green/90 text-black">
                Save API Key
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CurrencySettings;