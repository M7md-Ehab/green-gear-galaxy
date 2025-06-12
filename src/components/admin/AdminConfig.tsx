
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Key, Save } from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';
import { toast } from 'sonner';

// Configuration constants - modify these to change credentials
export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

export const USER_CREDENTIALS = {
  defaultPassword: 'user123'
};

const AdminConfig = () => {
  const { apiToken, setApiToken } = useCurrency();
  const [tempApiToken, setTempApiToken] = useState(apiToken || '');

  const handleSaveApiToken = () => {
    setApiToken(tempApiToken);
    toast.success('FXRates API token saved successfully');
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Settings className="h-5 w-5 text-brand-green" />
          Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="fxrates-token" className="text-gray-300">
              FXRates API Token
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="fxrates-token"
                type="password"
                placeholder="Enter your FXRates API token"
                value={tempApiToken}
                onChange={(e) => setTempApiToken(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
              />
              <Button
                onClick={handleSaveApiToken}
                className="bg-brand-green hover:bg-brand-green/90 text-black"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Get your free API token from{' '}
              <a 
                href="https://fxratesapi.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-green hover:underline"
              >
                fxratesapi.com
              </a>
            </p>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Key className="h-4 w-4 text-brand-green" />
              <span className="text-sm font-medium text-gray-300">Current Credentials</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Admin Username:</span>
                <span className="text-white font-mono">{ADMIN_CREDENTIALS.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Admin Password:</span>
                <span className="text-white font-mono">{ADMIN_CREDENTIALS.password}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              To change credentials, modify the values in src/components/admin/AdminConfig.tsx
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminConfig;
