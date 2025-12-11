import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Shield, Mail, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address').max(255),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  onCancel: () => void;
}

type Step = 'verify-identity' | 'edit-profile' | 'verify-email-change';

const ProfileForm = ({ onCancel }: ProfileFormProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('verify-identity');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [newEmailOtp, setNewEmailOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  // Fetch current profile data
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data) {
        form.setValue('name', data.full_name || '');
        form.setValue('email', data.email || user.email || '');
        setOriginalEmail(data.email || user.email || '');
        setOriginalName(data.full_name || '');
      }
    }
    fetchProfile();
  }, [user, form]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Step 1: Send OTP to current email for identity verification
  const handleSendVerificationOtp = async () => {
    if (!user?.email) {
      toast.error('No email associated with your account');
      return;
    }

    setIsSendingOtp(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: { shouldCreateUser: false }
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Verification code sent to your email');
      setCooldown(60);
    } catch (error) {
      toast.error('Failed to send verification code');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 1: Verify identity OTP
  const handleVerifyIdentity = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: user?.email || '',
        token: otp,
        type: 'email'
      });

      if (error) {
        toast.error('Invalid verification code');
        return;
      }

      toast.success('Identity verified');
      setStep('edit-profile');
      setOtp('');
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Check if email exists and handle profile update
  const onSubmit = async (data: ProfileFormValues) => {
    const emailChanged = data.email !== originalEmail;
    const nameChanged = data.name !== originalName;

    if (!emailChanged && !nameChanged) {
      toast.info('No changes to save');
      return;
    }

    // If only name changed, update immediately
    if (nameChanged && !emailChanged) {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: data.name })
          .eq('id', user?.id);

        if (error) throw error;
        
        toast.success('Profile updated successfully');
        onCancel();
      } catch (error) {
        toast.error('Failed to update profile');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // If email changed, check if it exists first
    if (emailChanged) {
      setIsLoading(true);
      try {
        // Check if email already exists by trying to sign in with OTP (won't create user)
        // We use a workaround: try to check profiles table for existing email
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', data.email)
          .maybeSingle();

        if (existingProfile) {
          toast.error('This email is already in use');
          setIsLoading(false);
          return;
        }

        // Email doesn't exist, send OTP to new email
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: data.email,
          options: { shouldCreateUser: false }
        });

        // Note: If user doesn't exist, this will fail which is expected
        // We'll use updateUser to change email instead
        
        // Send verification to new email using updateUser
        const { error: updateError } = await supabase.auth.updateUser({
          email: data.email
        });

        if (updateError) {
          toast.error(updateError.message);
          setIsLoading(false);
          return;
        }

        setPendingEmail(data.email);
        setStep('verify-email-change');
        toast.success('Verification code sent to your new email');
        setCooldown(60);

        // Also update name if changed
        if (nameChanged) {
          await supabase
            .from('profiles')
            .update({ full_name: data.name })
            .eq('id', user?.id);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to initiate email change');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Step 3: Verify new email OTP (Supabase handles this via email link)
  const handleVerifyNewEmail = async () => {
    if (newEmailOtp.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: newEmailOtp,
        type: 'email_change'
      });

      if (error) {
        toast.error('Invalid verification code');
        return;
      }

      // Update profile email
      await supabase
        .from('profiles')
        .update({ email: pendingEmail })
        .eq('id', user?.id);

      toast.success('Email updated successfully');
      onCancel();
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Render Step 1: Identity Verification
  if (step === 'verify-identity') {
    return (
      <Card className="bg-gray-900/80 border-gray-700">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-brand-green/20 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-brand-green" />
          </div>
          <CardTitle className="text-2xl text-white">Verify Your Identity</CardTitle>
          <CardDescription className="text-gray-400">
            For security, please verify your identity before making changes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-4">
              We'll send a verification code to: <span className="text-brand-green font-medium">{user?.email}</span>
            </p>
            
            {cooldown === 0 ? (
              <Button
                onClick={handleSendVerificationOtp}
                disabled={isSendingOtp}
                className="bg-brand-green hover:bg-brand-green/90 text-black"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Resend available in {cooldown}s</p>
                
                <div className="flex flex-col items-center gap-4">
                  <label className="text-sm text-gray-300">Enter verification code</label>
                  <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="bg-gray-800 border-gray-600 text-white" />
                      <InputOTPSlot index={1} className="bg-gray-800 border-gray-600 text-white" />
                      <InputOTPSlot index={2} className="bg-gray-800 border-gray-600 text-white" />
                      <InputOTPSlot index={3} className="bg-gray-800 border-gray-600 text-white" />
                      <InputOTPSlot index={4} className="bg-gray-800 border-gray-600 text-white" />
                      <InputOTPSlot index={5} className="bg-gray-800 border-gray-600 text-white" />
                    </InputOTPGroup>
                  </InputOTP>
                  
                  <Button
                    onClick={handleVerifyIdentity}
                    disabled={isLoading || otp.length !== 6}
                    className="w-full max-w-xs bg-brand-green hover:bg-brand-green/90 text-black"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Continue'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="w-full text-gray-400 hover:text-white"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render Step 3: Verify New Email
  if (step === 'verify-email-change') {
    return (
      <Card className="bg-gray-900/80 border-gray-700">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-brand-green/20 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-brand-green" />
          </div>
          <CardTitle className="text-2xl text-white">Verify New Email</CardTitle>
          <CardDescription className="text-gray-400">
            Enter the code sent to your new email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-4">
              Code sent to: <span className="text-brand-green font-medium">{pendingEmail}</span>
            </p>
            
            <div className="flex flex-col items-center gap-4">
              <InputOTP value={newEmailOtp} onChange={setNewEmailOtp} maxLength={6}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="bg-gray-800 border-gray-600 text-white" />
                  <InputOTPSlot index={1} className="bg-gray-800 border-gray-600 text-white" />
                  <InputOTPSlot index={2} className="bg-gray-800 border-gray-600 text-white" />
                  <InputOTPSlot index={3} className="bg-gray-800 border-gray-600 text-white" />
                  <InputOTPSlot index={4} className="bg-gray-800 border-gray-600 text-white" />
                  <InputOTPSlot index={5} className="bg-gray-800 border-gray-600 text-white" />
                </InputOTPGroup>
              </InputOTP>
              
              <Button
                onClick={handleVerifyNewEmail}
                disabled={isLoading || newEmailOtp.length !== 6}
                className="w-full max-w-xs bg-brand-green hover:bg-brand-green/90 text-black"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirm Email Change
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep('edit-profile')}
            className="w-full text-gray-400 hover:text-white"
          >
            Back to Edit Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render Step 2: Edit Profile Form
  return (
    <Card className="bg-gray-900/80 border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-brand-green/20 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-brand-green" />
          </div>
          <div>
            <CardTitle className="text-xl text-white">Edit Profile</CardTitle>
            <CardDescription className="text-gray-400">
              Update your personal information
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-brand-green bg-brand-green/10 px-3 py-2 rounded-lg">
          <CheckCircle className="h-4 w-4" />
          <span>Identity verified</span>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      className="bg-gray-800/50 border-gray-700 text-white focus:border-brand-green h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="bg-gray-800/50 border-gray-700 text-white focus:border-brand-green h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {field.value !== originalEmail && (
                    <div className="flex items-center gap-2 text-xs text-amber-400 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Changing email requires verification</span>
                    </div>
                  )}
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-brand-green hover:bg-brand-green/90 text-black h-12 font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-gray-600 text-white bg-gray-800 hover:bg-gray-700 h-12"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
