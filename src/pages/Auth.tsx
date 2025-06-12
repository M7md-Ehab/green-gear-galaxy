import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-firebase-auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import LanguageSelector from '@/components/LanguageSelector';
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
    sendVerificationEmail
  } = useAuth();
  const {
    t
  } = useLanguage();
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
    return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-brand-green/20 rounded-full flex items-center justify-center">
                  <Mail className="h-10 w-10 text-brand-green" />
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{t('checkEmail')}</h1>
                  <p className="text-gray-400">
                    {t('verificationSent')}
                  </p>
                </div>

                <div className="space-y-4">
                  <Button onClick={handleResendVerification} variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-800">
                    {t('resendVerification')}
                  </Button>
                  
                  <Button onClick={() => setNeedsVerification(false)} variant="ghost" className="w-full text-gray-400 hover:text-white">
                    {t('backToLogin')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col">
      {/* Header */}
      <div className="py-6 border-b border-gray-800/50 backdrop-blur-sm">
        <div className="container-custom flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center cursor-pointer group">
            <span className="text-3xl font-bold bg-clip-text bg-gradient-to-r from-white to-brand-green group-hover:from-brand-green group-hover:to-white transition-all duration-300 text-slate-50">
              Vlitrix
            </span>
          </button>
          <LanguageSelector />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <div className="mx-auto w-20 h-20 bg-brand-green/20 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-brand-green" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {isSignUp ? t('createAccount') : t('welcomeBack')}
                  </h1>
                  <p className="text-gray-400">
                    {isSignUp ? t('joinVlitrix') : t('signInToAccount')}
                  </p>
                </div>
              </div>

              {isSignUp ? <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6">
                    <FormField control={signupForm.control} name="name" render={({
                  field
                }) => <FormItem>
                          <FormLabel className="text-left block text-gray-300">{t('fullName')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input placeholder={t('enterFullName')} className="h-12 text-lg pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-brand-green focus:bg-gray-800" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={signupForm.control} name="email" render={({
                  field
                }) => <FormItem>
                          <FormLabel className="text-left block text-gray-300">{t('emailAddress')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input type="email" placeholder="name@example.com" className="h-12 text-lg pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-brand-green focus:bg-gray-800" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={signupForm.control} name="password" render={({
                  field
                }) => <FormItem>
                          <FormLabel className="text-left block text-gray-300">{t('password')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input type={showPassword ? "text" : "password"} placeholder={t('createSecurePassword')} className="h-12 text-lg pl-10 pr-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-brand-green focus:bg-gray-800" {...field} />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <Button type="submit" className="w-full h-12 bg-brand-green hover:bg-brand-green/90 text-black text-lg font-semibold transition-all duration-300" disabled={isLoading}>
                      {isLoading ? t('creatingAccount') : t('createAccount')}
                    </Button>
                  </form>
                </Form> : <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                    <FormField control={loginForm.control} name="email" render={({
                  field
                }) => <FormItem>
                          <FormLabel className="text-left block text-gray-300">{t('emailAddress')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input type="email" placeholder="name@example.com" className="h-12 text-lg pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-brand-green focus:bg-gray-800" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={loginForm.control} name="password" render={({
                  field
                }) => <FormItem>
                          <FormLabel className="text-left block text-gray-300">{t('password')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input type={showPassword ? "text" : "password"} placeholder={t('enterPassword')} className="h-12 text-lg pl-10 pr-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-brand-green focus:bg-gray-800" {...field} />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <Button type="submit" className="w-full h-12 bg-brand-green hover:bg-brand-green/90 text-black text-lg font-semibold transition-all duration-300" disabled={isLoading}>
                      {isLoading ? t('signingIn') : t('signIn')}
                    </Button>
                  </form>
                </Form>}

              <div className="space-y-4">
                <button type="button" onClick={handleForgotPassword} className="text-gray-400 hover:text-brand-green text-sm transition-colors">
                  {t('forgotPassword')}
                </button>
                
                <div className="text-center">
                  <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-gray-400 hover:text-brand-green text-sm transition-colors">
                    {isSignUp ? t('alreadyHaveAccount') : t('dontHaveAccount')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Auth;