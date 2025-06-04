
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Zap, Shield } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

import { useAuth } from '@/hooks/use-firebase-auth';
import { useLanguage } from '@/contexts/LanguageContext';
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
import LanguageSelector from '@/components/LanguageSelector';

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
  const location = useLocation();
  const { isLoggedIn, login, signup, resetPassword, sendVerificationEmail } = useAuth();
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  // Animation hooks
  const { ref: headerRef, inView: headerInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: formRef, inView: formInView } = useInView({ triggerOnce: true, threshold: 0.1 });

  // Redirect if already logged in
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
      // Error handled in service
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
      // Error handled in service
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendVerificationEmail();
    } catch (error) {
      // Error handled in service
    }
  };

  const handleForgotPassword = async () => {
    const email = isSignUp ? signupForm.getValues('email') : loginForm.getValues('email');
    if (email) {
      try {
        await resetPassword(email);
      } catch (error) {
        // Error handled in service
      }
    }
  };

  if (needsVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-[20%] right-[10%] w-72 h-72 rounded-full bg-brand-green/10 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[20%] left-[15%] w-96 h-96 rounded-full bg-brand-green/5 blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-md">
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl animate-scale-in">
              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-brand-green/20 rounded-full flex items-center justify-center animate-pulse">
                  <Mail className="h-8 w-8 text-brand-green" />
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
                  <p className="text-gray-400">
                    We've sent you a verification link. Please check your email and click the link to verify your account.
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={handleResendVerification}
                    variant="outline"
                    className="w-full border-brand-green text-brand-green hover:bg-brand-green/10"
                  >
                    Resend Verification Email
                  </Button>
                  
                  <Button
                    onClick={() => setNeedsVerification(false)}
                    variant="ghost"
                    className="w-full text-gray-400 hover:text-white"
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-[20%] right-[10%] w-72 h-72 rounded-full bg-brand-green/10 blur-3xl animate-pulse floating-animation"></div>
        <div className="absolute bottom-[20%] left-[15%] w-96 h-96 rounded-full bg-brand-green/5 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-[60%] right-[30%] w-48 h-48 rounded-full bg-brand-green/15 blur-2xl animate-pulse delay-500"></div>
        
        {/* Geometric patterns */}
        <div className="absolute top-[10%] left-[10%] w-32 h-32 border border-brand-green/20 rotate-45 animate-spin" style={{ animationDuration: '20s' }}></div>
        <div className="absolute bottom-[15%] right-[15%] w-24 h-24 border border-brand-green/10 rotate-12 animate-pulse"></div>
      </div>

      {/* Header */}
      <div ref={headerRef} className={`flex justify-between items-center p-6 relative z-10 transition-all duration-1000 ${headerInView ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="text-white font-bold text-2xl flex items-center gap-2 hover-scale">
          <div className="relative">
            <Zap className="h-6 w-6 text-brand-green animate-pulse" />
            <div className="absolute inset-0 bg-brand-green/20 rounded-full blur-xl"></div>
          </div>
          Vlitrix
        </div>
        <LanguageSelector />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div ref={formRef} className={`w-full max-w-md transition-all duration-1000 ${formInView ? 'animate-scale-in' : 'opacity-0 scale-95'}`}>
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-2xl tech-border">
            <div className="text-center space-y-6">
              <div className="animate-fade-in">
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <Shield className="h-12 w-12 text-brand-green" />
                    <div className="absolute inset-0 bg-brand-green/20 rounded-full blur-xl pulse-glow"></div>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 gradient-text">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h1>
                <p className="text-gray-400">
                  {isSignUp ? 'Join the future of gaming technology' : 'Sign in to your Vlitrix account'}
                </p>
              </div>

              {isSignUp ? (
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6">
                    <FormField
                      control={signupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="animate-fade-in delay-200">
                          <FormLabel className="text-left block text-gray-300">Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              className="h-12 text-lg bg-gray-800/50 border-gray-700 text-white focus:border-brand-green tech-border"
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
                        <FormItem className="animate-fade-in delay-300">
                          <FormLabel className="text-left block text-gray-300">Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                type="email"
                                placeholder="name@example.com"
                                className="h-12 text-lg pl-10 bg-gray-800/50 border-gray-700 text-white focus:border-brand-green tech-border"
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
                        <FormItem className="animate-fade-in delay-400">
                          <FormLabel className="text-left block text-gray-300">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a secure password"
                                className="h-12 text-lg pl-10 pr-10 bg-gray-800/50 border-gray-700 text-white focus:border-brand-green tech-border"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
                      className="w-full h-12 bg-brand-green hover:bg-brand-green/90 text-black text-lg font-semibold animate-fade-in delay-500 hover-scale pulse-glow"
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
                        <FormItem className="animate-fade-in delay-200">
                          <FormLabel className="text-left block text-gray-300">Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                type="email"
                                placeholder="name@example.com"
                                className="h-12 text-lg pl-10 bg-gray-800/50 border-gray-700 text-white focus:border-brand-green tech-border"
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
                        <FormItem className="animate-fade-in delay-300">
                          <FormLabel className="text-left block text-gray-300">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="h-12 text-lg pl-10 pr-10 bg-gray-800/50 border-gray-700 text-white focus:border-brand-green tech-border"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
                      className="w-full h-12 bg-brand-green hover:bg-brand-green/90 text-black text-lg font-semibold animate-fade-in delay-400 hover-scale pulse-glow"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </Form>
              )}

              <div className="space-y-4 animate-fade-in delay-600">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-brand-green hover:text-brand-green/80 text-sm transition-colors"
                >
                  Forgot your password?
                </button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
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
