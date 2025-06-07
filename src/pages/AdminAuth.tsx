
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, User, ArrowLeft, Shield } from 'lucide-react';

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
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-white hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="text-white font-bold text-2xl">
            Vlitrix
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-gray-600" />
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Admin Access
                </h1>
                <p className="text-gray-600">
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
                        <FormLabel className="text-left block text-gray-700">Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              placeholder="Enter admin username"
                              className="h-12 text-lg pl-10 bg-white border-gray-300 text-gray-900"
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
                        <FormLabel className="text-left block text-gray-700">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              type="password"
                              placeholder="Enter admin password"
                              className="h-12 text-lg pl-10 bg-white border-gray-300 text-gray-900"
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
                    className="w-full h-12 bg-black hover:bg-gray-800 text-white text-lg font-semibold"
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
