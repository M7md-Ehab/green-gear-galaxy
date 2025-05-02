
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';

// Login Schema
const loginSchema = z.object({
  email: z.string().min(1, { message: 'Email is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// Register Schema
const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Verification Schema
const verificationSchema = z.object({
  code: z.string().min(6, { message: 'Please enter the 6-digit code' })
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type VerificationFormValues = z.infer<typeof verificationSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('login');
  
  const { 
    isLoggedIn, 
    isVerifying, 
    login, 
    register: registerUser, 
    verifyCode 
  } = useAuth();
  
  useEffect(() => {
    // Check if already logged in
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  // Login Form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Register Form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  // Verification Form
  const verificationForm = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: '',
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    login(data.email, data.password);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerUser(data.name, data.email, data.password);
    setActiveTab('login');
    toast.success('Registration successful', {
      description: 'Please log in with your new account',
    });
  };
  
  const onVerificationSubmit = (data: VerificationFormValues) => {
    const success = verifyCode(data.code);
    if (success) {
      navigate('/dashboard');
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <main className="flex-grow py-12">
          <div className="container-custom max-w-md mx-auto">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2" 
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={16} />
                Back
              </Button>
            </div>
            <h1 className="text-4xl font-bold mb-8 text-center">Verify Your Account</h1>
            
            <div className="bg-gray-900/50 rounded-lg overflow-hidden p-6">
              <p className="mb-4 text-center">
                We've sent a verification code to your email address. 
                Please enter the code below to complete your login.
              </p>
              
              <Form {...verificationForm}>
                <form onSubmit={verificationForm.handleSubmit(onVerificationSubmit)} className="space-y-4">
                  <FormField
                    control={verificationForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter 6-digit code" 
                            {...field} 
                            className="text-center text-xl tracking-widest"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-brand-green hover:bg-brand-green/90 text-black"
                    >
                      Verify
                    </Button>
                  </div>
                  
                  <div className="text-center text-sm text-gray-400">
                    <a href="#" className="hover:text-brand-green">
                      Didn't receive a code? Resend
                    </a>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom max-w-md mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} />
              Back
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-8 text-center">Account</h1>
          
          <div className="bg-gray-900/50 rounded-lg overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-gray-800">
                <TabsTrigger value="login" className="w-1/2">Login</TabsTrigger>
                <TabsTrigger value="register" className="w-1/2">Register</TabsTrigger>
              </TabsList>
              
              <div className="p-6">
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username/Email</FormLabel>
                            <FormControl>
                              <Input placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="******" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          className="w-full bg-brand-green hover:bg-brand-green/90 text-black"
                        >
                          Login
                        </Button>
                      </div>
                      
                      <div className="text-center text-sm text-gray-400">
                        <Link to="/" className="hover:text-brand-green">
                          Forgot your password?
                        </Link>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="******" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="******" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          className="w-full bg-brand-green hover:bg-brand-green/90 text-black"
                        >
                          Register
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
