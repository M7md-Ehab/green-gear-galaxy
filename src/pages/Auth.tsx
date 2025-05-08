
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
import { useAuth, useAuthListener } from '@/hooks/use-auth';
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from '@/components/ui/input-otp';

// Login Schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
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

// OTP Schema
const otpSchema = z.object({
  otp: z.string().length(6, { message: 'OTP code must be 6 digits' }),
});

// Reset Password Email Schema
const resetPasswordEmailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

// Reset Password Schema
const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type OTPFormValues = z.infer<typeof otpSchema>;
type ResetPasswordEmailFormValues = z.infer<typeof resetPasswordEmailSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('login');
  const [verificationEmail, setVerificationEmail] = useState<string>('');
  const [verificationStep, setVerificationStep] = useState<
    'login' | 'register' | 'verify-otp' | 'forgot-password' | 'reset-password'
  >('login');
  
  // Setup auth listener
  useAuthListener();
  
  const { 
    isLoggedIn, 
    isLoading, 
    login, 
    register: registerUser, 
    verifyOTP,
    resetPassword, 
    updatePassword
  } = useAuth();
  
  useEffect(() => {
    // Check if already logged in
    if (isLoggedIn && !isLoading) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, isLoading, navigate]);

  // Handle back button click - go to previous page or return to authentication step
  const handleBack = () => {
    if (verificationStep === 'verify-otp') {
      setVerificationStep(activeTab === 'login' ? 'login' : 'register');
      return;
    }
    
    if (verificationStep === 'reset-password') {
      setVerificationStep('verify-otp');
      return;
    }
    
    if (verificationStep === 'forgot-password') {
      setVerificationStep('login');
      return;
    }
    
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

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
  
  // OTP Verification Form
  const otpForm = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });
  
  // Forgot Password Email Form
  const resetPasswordEmailForm = useForm<ResetPasswordEmailFormValues>({
    resolver: zodResolver(resetPasswordEmailSchema),
    defaultValues: {
      email: '',
    },
  });
  
  // Reset Password Form
  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      const result = await login(data.email, data.password);
      
      // Always show OTP verification for login attempts
      if (result?.needsOTP) {
        setVerificationEmail(data.email);
        setVerificationStep('verify-otp');
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      const result = await registerUser(data.name, data.email, data.password);
      
      // Only show OTP verification if account creation was successful
      if (result?.needsOTP) {
        setVerificationEmail(data.email);
        setVerificationStep('verify-otp');
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  };
  
  const onOTPSubmit = async (data: OTPFormValues) => {
    try {
      await verifyOTP(verificationEmail, data.otp);
      
      // If this was for password reset, move to reset password step
      if (activeTab === 'login' && verificationStep === 'verify-otp') {
        // This was a login verification
        navigate('/dashboard');
      }
    } catch (error) {
      // The error is already handled in verifyOTP with toast
      console.error("OTP verification error:", error);
      otpForm.reset();
    }
  };
  
  const onForgotPasswordSubmit = async (data: ResetPasswordEmailFormValues) => {
    try {
      const result = await resetPassword(data.email);
      
      if (result?.needsOTP) {
        setVerificationEmail(data.email);
        setVerificationStep('verify-otp');
        // Set active tab to indicate we're in password reset flow
        setActiveTab('reset-password');
      }
    } catch (error) {
      console.error("Password reset request error:", error);
    }
  };
  
  const onResetPasswordSubmit = async (data: ResetPasswordFormValues) => {
    try {
      await updatePassword(data.password);
      
      // Return to login screen after password reset
      toast.success('Password reset successful', { 
        description: 'Please log in with your new password' 
      });
      setVerificationStep('login');
      setActiveTab('login');
    } catch (error) {
      console.error("Password reset error:", error);
    }
  };
  
  const handleResendCode = async () => {
    try {
      // Attempt to re-send OTP based on current flow
      const { error } = await supabase.auth.signInWithOtp({
        email: verificationEmail,
        options: { shouldCreateUser: false }
      });
      
      if (error) throw error;
      
      toast.info("Verification code resent", { 
        description: "Please check your email inbox" 
      });
    } catch (error: any) {
      toast.error("Failed to resend code", { 
        description: error.message || "Please try again later" 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-green mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Show OTP verification screen
  if (verificationStep === 'verify-otp') {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <main className="flex-grow py-12">
          <div className="container-custom max-w-md mx-auto">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2" 
                onClick={handleBack}
              >
                <ArrowLeft size={16} />
                Back
              </Button>
            </div>
            <h1 className="text-4xl font-bold mb-3 text-center">Verify Your Email</h1>
            <p className="text-center text-gray-400 mb-8">
              We've sent a 6-digit verification code to <span className="font-medium text-white">{verificationEmail}</span>
            </p>
            
            <div className="bg-gray-900/50 rounded-lg overflow-hidden p-6">
              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-6">
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enter Verification Code</FormLabel>
                        <FormControl>
                          <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-brand-green hover:bg-brand-green/90 text-black"
                  >
                    {activeTab === 'reset-password' ? 'Verify to Reset Password' : 'Verify'}
                  </Button>
                  
                  <div className="text-center text-sm text-gray-400">
                    <button 
                      type="button" 
                      className="hover:text-brand-green"
                      onClick={handleResendCode}
                    >
                      Didn't receive a code? Resend
                    </button>
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
  
  // Show Reset Password screen
  if (verificationStep === 'reset-password') {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <main className="flex-grow py-12">
          <div className="container-custom max-w-md mx-auto">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2" 
                onClick={handleBack}
              >
                <ArrowLeft size={16} />
                Back
              </Button>
            </div>
            <h1 className="text-4xl font-bold mb-3 text-center">Reset Your Password</h1>
            <p className="text-center text-gray-400 mb-8">
              Please enter your new password
            </p>
            
            <div className="bg-gray-900/50 rounded-lg overflow-hidden p-6">
              <Form {...resetPasswordForm}>
                <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-6">
                  <FormField
                    control={resetPasswordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={resetPasswordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-brand-green hover:bg-brand-green/90 text-black"
                  >
                    Reset Password
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Show Forgot Password screen
  if (verificationStep === 'forgot-password') {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <main className="flex-grow py-12">
          <div className="container-custom max-w-md mx-auto">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2" 
                onClick={handleBack}
              >
                <ArrowLeft size={16} />
                Back
              </Button>
            </div>
            <h1 className="text-4xl font-bold mb-3 text-center">Reset Password</h1>
            <p className="text-center text-gray-400 mb-8">
              Enter your email to receive a verification code
            </p>
            
            <div className="bg-gray-900/50 rounded-lg overflow-hidden p-6">
              <Form {...resetPasswordEmailForm}>
                <form onSubmit={resetPasswordEmailForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-6">
                  <FormField
                    control={resetPasswordEmailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-brand-green hover:bg-brand-green/90 text-black"
                  >
                    Send Reset Code
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Main login/register screen
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom max-w-md mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2" 
              onClick={handleBack}
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
                            <FormLabel>Email</FormLabel>
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
                        <button 
                          type="button"
                          onClick={() => setVerificationStep('forgot-password')} 
                          className="hover:text-brand-green"
                        >
                          Forgot your password?
                        </button>
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
