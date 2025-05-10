import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Key, LogIn } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [cooldownActive, setCooldownActive] = useState<boolean>(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState<boolean>(false);
  
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

  // Cooldown timer for OTP
  useEffect(() => {
    let interval: number | undefined;
    
    if (cooldownActive && cooldownRemaining > 0) {
      interval = window.setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) {
            setCooldownActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownActive, cooldownRemaining]);

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
      if (activeTab === 'reset-password') {
        setVerificationStep('reset-password');
        return;
      } 
      
      // Otherwise this was for login/registration verification
      navigate('/dashboard');
    } catch (error: any) {
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
        setForgotPasswordOpen(false);
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
    // If a cooldown is active, don't allow resending
    if (cooldownActive) {
      toast.error("Please wait", {
        description: `You can request a new code in ${cooldownRemaining} seconds`
      });
      return;
    }

    try {
      // Attempt to re-send OTP based on current flow
      const { error } = await supabase.auth.signInWithOtp({
        email: verificationEmail,
        options: { shouldCreateUser: false }
      });
      
      if (error) {
        // Check if this is a rate limit error
        if (error.message?.toLowerCase().includes('rate limit') || 
            error.message?.includes('only request this after')) {
          // Extract the wait time if available
          const waitTimeMatch = error.message.match(/(\d+) seconds/);
          const waitTime = waitTimeMatch ? parseInt(waitTimeMatch[1]) : 60;
          
          setCooldownActive(true);
          setCooldownRemaining(waitTime);
          
          toast.error("Rate limit exceeded", { 
            description: `Please wait ${waitTime} seconds before requesting another code` 
          });
          return;
        }
        
        throw error;
      }
      
      // Set a standard cooldown even if the API doesn't enforce one
      setCooldownActive(true);
      setCooldownRemaining(60); // Standard 60 second cooldown
      
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
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <main className="flex-grow flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }
  
  // Show OTP verification screen
  if (verificationStep === 'verify-otp') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <main className="flex-grow flex justify-center items-center py-12 px-4">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Key className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-semibold mb-2">Verification code</h1>
              <p className="text-gray-600 dark:text-gray-400">
                We've sent a verification code to <span className="font-medium">{verificationEmail}</span>
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden p-6">
              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-6">
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-center block text-sm">Enter the 6-digit code</FormLabel>
                        <FormControl>
                          <InputOTP maxLength={6} {...field} className="gap-2 justify-center">
                            <InputOTPGroup className="gap-2">
                              <InputOTPSlot index={0} className="h-12 w-12" />
                              <InputOTPSlot index={1} className="h-12 w-12" />
                              <InputOTPSlot index={2} className="h-12 w-12" />
                              <InputOTPSlot index={3} className="h-12 w-12" />
                              <InputOTPSlot index={4} className="h-12 w-12" />
                              <InputOTPSlot index={5} className="h-12 w-12" />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                  >
                    {activeTab === 'reset-password' ? 'Continue' : 'Continue'}
                  </Button>
                  
                  <div className="text-center text-sm">
                    <button 
                      type="button" 
                      className={`text-primary hover:underline ${cooldownActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={handleResendCode}
                      disabled={cooldownActive}
                    >
                      {cooldownActive 
                        ? `Resend code in ${cooldownRemaining}s` 
                        : "Didn't receive a code? Resend"}
                    </button>
                  </div>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleBack}
                      className="text-sm"
                    >
                      Back
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // Show Reset Password screen
  if (verificationStep === 'reset-password') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <main className="flex-grow flex justify-center items-center py-12 px-4">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-semibold mb-2">Reset your password</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a new password
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden p-6">
              <Form {...resetPasswordForm}>
                <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={resetPasswordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••" {...field} />
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
                          <Input type="password" placeholder="••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-2"
                  >
                    Reset password
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleBack}
                      className="text-sm"
                    >
                      Back
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main login/register screen
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <main className="flex-grow flex justify-center items-center py-8 px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-semibold">Welcome</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {activeTab === 'login' ? 'Log in to your account' : 'Create your account'}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login" className="rounded-none">Log in</TabsTrigger>
                <TabsTrigger value="register" className="rounded-none">Sign up</TabsTrigger>
              </TabsList>
              
              <div className="p-6">
                <TabsContent value="login" className="mt-0">
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
                              <Input type="password" placeholder="••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          className="w-full"
                        >
                          Continue
                        </Button>
                      </div>
                      
                      <div className="text-center">
                        <button 
                          type="button"
                          onClick={() => setForgotPasswordOpen(true)} 
                          className="text-sm text-primary hover:underline"
                        >
                          Forgot your password?
                        </button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="register" className="mt-0">
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
                              <Input type="password" placeholder="••••••" {...field} />
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
                              <Input type="password" placeholder="••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          className="w-full"
                        >
                          Continue
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
              </div>
            </Tabs>
            
            <div className="px-6 pb-6 text-center text-sm text-gray-600 dark:text-gray-400">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-sm"
              >
                Back to home
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a verification code to reset your password.
            </DialogDescription>
          </DialogHeader>
          <Form {...resetPasswordEmailForm}>
            <form onSubmit={resetPasswordEmailForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
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
                className="w-full"
              >
                Send reset code
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
