import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-supabase-auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import LanguageSelector from '@/components/LanguageSelector';
import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal';
import Navbar from '@/components/layout/Navbar';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters')
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const {
    isLoggedIn,
    login,
    signup,
    resetPassword,
    signInWithGoogle,
    signInWithTwitter
  } = useAuth();
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      name: ''
    }
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
      // For Supabase, we can trigger a resend by calling signup again
      const email = signupForm.getValues('email') || loginForm.getValues('email');
      if (email) {
        await resetPassword(email);
      }
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'twitter') => {
    setIsLoading(true);
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithTwitter();
      }
      navigate('/dashboard');
    } catch (error) {
      console.error(`${provider} login error:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  if (needsVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-brand-green/20 rounded-full flex items-center justify-center">
                  <Mail className="h-10 w-10 text-brand-green" />
                </div>
                
                <div className="space-y-3">
                  <h1 className="text-3xl font-bold text-white">{t('checkEmail')}</h1>
                  <p className="text-gray-400 leading-relaxed">
                    {t('verificationSent')}
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  <Button 
                    onClick={handleResendVerification} 
                    variant="outline" 
                    className="w-full border-gray-600 text-white hover:bg-gray-800 h-12"
                  >
                    {t('resendVerification')}
                  </Button>
                  
                  <Button 
                    onClick={() => setNeedsVerification(false)} 
                    variant="ghost" 
                    className="w-full text-gray-400 hover:text-white h-12"
                  >
                    {t('backToLogin')}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col">
      {/* Header with Navbar */}
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
            <div className="text-center space-y-8">
              <div className="space-y-6">
                <div className="mx-auto w-20 h-20 bg-brand-green/20 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-brand-green" />
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl font-bold text-white tracking-wide">
                    {isSignUp ? t('createAccount') : t('welcomeBack')}
                  </h1>
                  <p className="text-gray-400 leading-relaxed">
                    {isSignUp ? t('joinVlitrix') : t('signInToAccount')}
                  </p>
                </div>
              </div>

              {isSignUp ? (
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6">
                    <FormField
                      control={signupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-left block text-gray-300 text-sm font-medium">
                            {t('fullName')}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                placeholder={t('enterFullName')}
                                className="h-12 text-base pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-brand-green focus:bg-gray-800"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-left block text-gray-300 text-sm font-medium">
                            {t('emailAddress')}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                type="email"
                                placeholder="name@example.com"
                                className="h-12 text-base pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-brand-green focus:bg-gray-800"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-left block text-gray-300 text-sm font-medium">
                            {t('password')}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder={t('createSecurePassword')}
                                className="h-12 text-base pl-10 pr-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-brand-green focus:bg-gray-800"
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
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12 bg-brand-green hover:bg-brand-green/90 text-black text-base font-semibold transition-all duration-300 mt-6"
                      disabled={isLoading}
                    >
                      {isLoading ? t('creatingAccount') : t('createAccount')}
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
                        <FormItem className="space-y-2">
                          <FormLabel className="text-left block text-gray-300 text-sm font-medium">
                            {t('emailAddress')}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                type="email"
                                placeholder="name@example.com"
                                className="h-12 text-base pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-brand-green focus:bg-gray-800"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-left block text-gray-300 text-sm font-medium">
                            {t('password')}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder={t('enterPassword')}
                                className="h-12 text-base pl-10 pr-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-brand-green focus:bg-gray-800"
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
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12 bg-brand-green hover:bg-brand-green/90 text-black text-base font-semibold transition-all duration-300 mt-6"
                      disabled={isLoading}
                    >
                      {isLoading ? t('signingIn') : t('signIn')}
                    </Button>
                  </form>
                </Form>
              )}

              {/* Social Login */}
              <div className="space-y-4 pt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                    className="border-gray-600 text-white hover:bg-gray-800 h-12"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin('twitter')}
                    disabled={isLoading}
                    className="border-gray-600 text-white hover:bg-gray-800 h-12"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X
                  </Button>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-gray-400 hover:text-brand-green text-sm transition-colors tracking-wide"
                >
                  {t('forgotPassword')}
                </button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-gray-400 hover:text-brand-green text-sm transition-colors tracking-wide"
                  >
                    {isSignUp ? t('alreadyHaveAccount') : t('dontHaveAccount')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
    </div>
  );
};

export default Auth;
