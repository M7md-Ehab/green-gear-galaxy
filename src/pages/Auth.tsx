import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Mail } from 'lucide-react';

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

const otpSchema = z.object({
  otp: z.string().min(6, 'Please enter the 6-digit code'),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type OTPFormValues = z.infer<typeof otpSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, login, signup, verifyOTP, resetPassword } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);

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

  const otpForm = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const onEmailSubmit = async (data: EmailFormValues) => {
    setIsLoading(true);
    setEmail(data.email);

    try {
      if (isResetPassword) {
        const result = await resetPassword(data.email);
        if (result?.needsOTP) {
          setStep('otp');
          toast.success(t('verification_sent'));
        }
      } else {
        // Try login first
        const loginResult = await login(data.email, '');
        if (loginResult?.needsOTP) {
          setIsSignUp(false);
          setStep('otp');
          toast.success(t('verification_sent'));
        } else {
          // If login fails, try signup
          const signupResult = await signup(data.email, '', '');
          if (signupResult?.needsOTP) {
            setIsSignUp(true);
            setStep('otp');
            toast.success(t('verification_sent'));
          }
        }
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
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
    if (isResetPassword) {
      await resetPassword(email);
    } else if (isSignUp) {
      await signup(email, '', '');
    } else {
      await login(email, '');
    }
    toast.success(t('verification_sent'));
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('email');
      otpForm.reset();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black">
        <div className="text-white font-bold text-xl">Vlitrix</div>
        <LanguageSelector />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {step === 'email' ? (
            <div className="text-center space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {isResetPassword ? 'Reset your password' : t('welcome_back')}
                </h1>
                <p className="text-gray-600">
                  {isResetPassword ? 'Enter your email to reset your password' : 'Enter your email to continue'}
                </p>
              </div>

              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-left block text-gray-700">{t('email_address')}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="name@example.com"
                            className="h-12 text-lg"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 bg-black hover:bg-gray-800 text-white text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : t('continue')}
                  </Button>
                </form>
              </Form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('back')}
                </Button>
              </div>

              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-white" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('verify_email')}
                  </h1>
                  <p className="text-gray-600">
                    {t('enter_code')} <span className="font-medium">{email}</span>
                  </p>
                </div>

                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-6">
                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex justify-center">
                              <InputOTP
                                maxLength={6}
                                value={field.value}
                                onChange={field.onChange}
                                className="text-center"
                              >
                                <InputOTPGroup className="gap-2">
                                  <InputOTPSlot index={0} className="w-12 h-12 text-xl border-2" />
                                  <InputOTPSlot index={1} className="w-12 h-12 text-xl border-2" />
                                  <InputOTPSlot index={2} className="w-12 h-12 text-xl border-2" />
                                  <InputOTPSlot index={3} className="w-12 h-12 text-xl border-2" />
                                  <InputOTPSlot index={4} className="w-12 h-12 text-xl border-2" />
                                  <InputOTPSlot index={5} className="w-12 h-12 text-xl border-2" />
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
                      className="w-full h-12 bg-black hover:bg-gray-800 text-white text-lg"
                      disabled={isLoading || otpForm.watch('otp').length !== 6}
                    >
                      {isLoading ? 'Verifying...' : t('verify')}
                    </Button>
                  </form>
                </Form>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={handleResendCode}
                    className="text-gray-600 hover:text-gray-900"
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
  );
};

export default Auth;
