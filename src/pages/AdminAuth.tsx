
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, User, Shield } from 'lucide-react';

import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

const AdminAuth = () => {
  const navigate = useNavigate();
  const { isAdminLoggedIn, adminLogin } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAdminLoggedIn) {
      navigate('/admin');
    }
  }, [isAdminLoggedIn, navigate]);

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    setIsLoading(true);
    try {
      const success = await adminLogin(data.username, data.password);
      if (success) {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Admin login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header with home page styling */}
      <div className="py-4 border-b border-border/40">
        <div className="container-custom flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center cursor-pointer"
          >
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-brand-green">Vlitrix</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/50 rounded-lg p-8 shadow-lg border border-gray-700">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-brand-green/20 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-brand-green" />
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Admin Access
                </h1>
                <p className="text-gray-400">
                  Enter your admin credentials to continue
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-left block text-gray-300">Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              placeholder="Enter admin username"
                              className="h-12 text-lg pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-brand-green"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-left block text-gray-300">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              type="password"
                              placeholder="Enter admin password"
                              className="h-12 text-lg pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-brand-green"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 bg-brand-green hover:bg-brand-green/90 text-black text-lg font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In as Admin'}
                  </Button>
                </form>
              </Form>

              <div className="text-center text-sm text-gray-500">
                <p>Default credentials: admin / admin123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
