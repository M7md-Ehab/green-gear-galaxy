
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

import { useAuth } from '@/hooks/use-firebase-auth';
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

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const { isLoggedIn, login, signup, resetPassword, sendVerificationEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', name: '' },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);
      if (result?.needsVerification) {
        setNeedsVerification(true);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const result = await signup(data.email, data.password, data.name);
      if (result?.needsVerification) {
        setNeedsVerification(true);
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendVerificationEmail();
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  const handleForgotPassword = async () => {
    const email = isSignUp ? signupForm.getValues('email') : loginForm.getValues('email');
    if (email) {
      try {
        await resetPassword(email);
      } catch (error) {
        console.error('Reset password error:', error);
      }
    }
  };

  if (needsVerification) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-gray-600" />
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
                  <p className="text-gray-600">
                    We've sent you a verification link. Please check your email and click the link to verify your account.
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={handleResendVerification}
                    variant="outline"
                    className="w-full"
                  >
                    Resend Verification Email
                  </Button>
                  
                  <Button
                    onClick={() => setNeedsVerification(false)}
                    variant="ghost"
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex justify-between items-center p-6">
        <div className="text-white font-bold text-2xl">
          Vlitrix
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="text-center space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h1>
                <p className="text-gray-600">
                  {isSignUp ? 'Join Vlitrix today' : 'Sign in to your account'}
                </p>
              </div>

              {isSignUp ? (
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6">
                    <FormField
                      control={signupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-left block text-gray-700">Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              className="h-12 text-lg bg-white border-gray-300 text-gray-900"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-left block text-gray-700">Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                type="email"
                                placeholder="name@example.com"
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
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-left block text-gray-700">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a secure password"
                                className="h-12 text-lg pl-10 pr-10 bg-white border-gray-300 text-gray-900"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
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
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-left block text-gray-700">Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                type="email"
                                placeholder="name@example.com"
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
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-left block text-gray-700">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="h-12 text-lg pl-10 pr-10 bg-white border-gray-300 text-gray-900"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
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
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </Form>
              )}

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Forgot your password?
                </button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
