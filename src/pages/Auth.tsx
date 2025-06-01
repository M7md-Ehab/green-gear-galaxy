
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';

import { useAuth, useAuthListener } from '@/hooks/use-auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import LanguageSelector from '@/components/LanguageSelector';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const passwordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const otpSchema = z.object({
  otp: z.string().min(6, 'Please enter the 6-digit code'),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type OTPFormValues = z.infer<typeof otpSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, login, signup, verifyOTP, resetPassword } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState<'email' | 'password' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'magic' | 'password'>('password');

  // Setup auth listener
  useAuthListener();

  // Check if this is a password reset flow
  useEffect(() => {
    if (location.pathname === '/auth/reset-password') {
      setIsResetPassword(true);
      setStep('otp');
    }
  }, [location.pathname]);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: '', password: '' },
  });

  const otpForm = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const onEmailSubmit = async (data: EmailFormValues) => {
    setIsLoading(true);
    setEmail(data.email);

    try {
      const result = await login(data.email);
      if (result?.needsOTP) {
        setStep('otp');
        toast.success(t('verification_sent'));
      }
    } catch (error) {
      // If user doesn't exist, show signup option
      const signupResult = await signup(data.email, '', '');
      if (signupResult?.needsOTP) {
        setIsSignUp(true);
        setStep('otp');
        toast.success(t('verification_sent'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);
    setEmail(data.email);

    try {
      if (isSignUp) {
        const result = await signup(data.email, data.password, '');
        if (result?.needsOTP) {
          setStep('otp');
          toast.success(t('verification_sent'));
        } else {
          navigate('/dashboard');
        }
      } else {
        await login(data.email, data.password);
        navigate('/dashboard');
      }
    } catch (error) {
      if (!isSignUp) {
        // Try signup if login fails
        setIsSignUp(true);
        toast.info('Creating new account...');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onOTPSubmit = async (data: OTPFormValues) => {
    setIsLoading(true);

    try {
      await verifyOTP(email, data.otp);
      toast.success('Successfully verified!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(t('invalid_code'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (authMode === 'magic') {
      await login(email);
    } else {
      if (isSignUp) {
        await signup(email, '', '');
      } else {
        await login(email);
      }
    }
    toast.success(t('verification_sent'));
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep(authMode === 'magic' ? 'email' : 'password');
      otpForm.reset();
    } else if (step === 'password') {
      setStep('email');
      passwordForm.reset();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-[20%] right-[10%] w-72 h-72 rounded-full bg-brand-green/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[20%] left-[15%] w-96 h-96 rounded-full bg-brand-green/5 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-[60%] right-[30%] w-48 h-48 rounded-full bg-brand-green/15 blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center p-6 relative z-10">
        <div className="text-white font-bold text-2xl flex items-center gap-2">
          <Zap className="h-6 w-6 text-brand-green" />
          Vlitrix
        </div>
        <LanguageSelector />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl animate-scale-in">
            {step === 'email' ? (
              <div className="text-center space-y-6">
                <div className="animate-fade-in">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome to Vlitrix
                  </h1>
                  <p className="text-gray-400">
                    Enter your email to get started
                  </p>
                </div>

                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="animate-fade-in delay-200">
                          <FormLabel className="text-left block text-gray-300">{t('email_address')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                type="email"
                                placeholder="name@example.com"
                                className="h-12 text-lg pl-10 bg-gray-800 border-gray-700 text-white focus:border-brand-green"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4 animate-fade-in delay-300">
                      <Button
                        type="submit"
                        className="w-full h-12 bg-brand-green hover:bg-brand-green/90 text-black text-lg font-semibold hover-scale"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Loading...' : t('continue')}
                      </Button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setStep('password')}
                          className="text-brand-green hover:text-brand-green/80 text-sm"
                        >
                          Sign in with password instead
                        </button>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
            ) : step === 'password' ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 animate-fade-in">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('back')}
                  </Button>
                </div>

                <div className="text-center space-y-4 animate-fade-in delay-200">
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </h1>
                  <p className="text-gray-400">
                    {isSignUp ? 'Create your Vlitrix account' : 'Welcome back to Vlitrix'}
                  </p>
                </div>

                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="animate-fade-in delay-300">
                          <FormLabel className="text-left block text-gray-300">{t('email_address')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                type="email"
                                placeholder="name@example.com"
                                className="h-12 text-lg pl-10 bg-gray-800 border-gray-700 text-white focus:border-brand-green"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="animate-fade-in delay-400">
                          <FormLabel className="text-left block text-gray-300">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="h-12 text-lg pl-10 pr-10 bg-gray-800 border-gray-700 text-white focus:border-brand-green"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
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
                      className="w-full h-12 bg-brand-green hover:bg-brand-green/90 text-black text-lg font-semibold animate-fade-in delay-500 hover-scale"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
                    </Button>

                    <div className="text-center animate-fade-in delay-600">
                      <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-brand-green hover:text-brand-green/80 text-sm"
                      >
                        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                      </button>
                    </div>
                  </form>
                </Form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 animate-fade-in">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('back')}
                  </Button>
                </div>

                <div className="text-center space-y-4 animate-fade-in delay-200">
                  <div className="mx-auto w-16 h-16 bg-brand-green/20 rounded-full flex items-center justify-center animate-pulse">
                    <Mail className="h-8 w-8 text-brand-green" />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                      {t('verify_email')}
                    </h1>
                    <p className="text-gray-400">
                      {t('enter_code')} <span className="font-medium text-white">{email}</span>
                    </p>
                  </div>

                  <Form {...otpForm}>
                    <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-6">
                      <FormField
                        control={otpForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem className="animate-fade-in delay-300">
                            <FormControl>
                              <div className="flex justify-center">
                                <InputOTP
                                  maxLength={6}
                                  value={field.value}
                                  onChange={field.onChange}
                                  className="text-center"
                                >
                                  <InputOTPGroup className="gap-3">
                                    <InputOTPSlot index={0} className="w-12 h-12 text-xl border-2 border-gray-700 bg-gray-800 text-white focus:border-brand-green" />
                                    <InputOTPSlot index={1} className="w-12 h-12 text-xl border-2 border-gray-700 bg-gray-800 text-white focus:border-brand-green" />
                                    <InputOTPSlot index={2} className="w-12 h-12 text-xl border-2 border-gray-700 bg-gray-800 text-white focus:border-brand-green" />
                                    <InputOTPSlot index={3} className="w-12 h-12 text-xl border-2 border-gray-700 bg-gray-800 text-white focus:border-brand-green" />
                                    <InputOTPSlot index={4} className="w-12 h-12 text-xl border-2 border-gray-700 bg-gray-800 text-white focus:border-brand-green" />
                                    <InputOTPSlot index={5} className="w-12 h-12 text-xl border-2 border-gray-700 bg-gray-800 text-white focus:border-brand-green" />
                                  </InputOTPGroup>
                                </InputOTP>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full h-12 bg-brand-green hover:bg-brand-green/90 text-black text-lg font-semibold animate-fade-in delay-400 hover-scale"
                        disabled={isLoading || otpForm.watch('otp').length !== 6}
                      >
                        {isLoading ? 'Verifying...' : t('verify')}
                      </Button>
                    </form>
                  </Form>

                  <div className="text-center animate-fade-in delay-500">
                    <Button
                      variant="link"
                      onClick={handleResendCode}
                      className="text-brand-green hover:text-brand-green/80"
                    >
                      {t('resend_code')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
