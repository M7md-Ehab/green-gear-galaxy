import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps) => {
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSendCode = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown} seconds before requesting a new code`);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-otp', {
        body: { email }
      });

      if (error) {
        throw error;
      }

      setStep('code');
      setAttempts(0);
      setCooldown(60);
      toast.success(`Verification code sent to ${email}`);
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyCode = () => {
    const enteredCode = code.join('');
    
    if (enteredCode.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setStep('password');
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { 
          email, 
          otpCode: code.join(''), 
          newPassword 
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast.success('Password reset successful! You can now log in with your new password.');
        handleClose();
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 8 || error.message?.includes("Too many attempts")) {
        toast.error('Too many attempts. Please request a new code.');
        setStep('email');
        setCode(['', '', '', '', '', '']);
        setAttempts(0);
      } else {
        toast.error(error.message || `Wrong code. ${8 - newAttempts} attempts remaining.`);
        setStep('code');
        setCode(['', '', '', '', '', '']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestNewCode = async () => {
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown} seconds before requesting a new code`);
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-otp', {
        body: { email }
      });

      if (error) {
        throw error;
      }

      setCooldown(60);
      setAttempts(0);
      setCode(['', '', '', '', '', '']);
      toast.success('New verification code sent!');
    } catch (error: any) {
      console.error('Error sending new OTP:', error);
      toast.error(error.message || 'Failed to send new verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setCode(['', '', '', '', '', '']);
    setNewPassword('');
    setAttempts(0);
    setCooldown(0);
    onClose();
  };

  const handleBack = () => {
    if (step === 'code') {
      setStep('email');
    } else if (step === 'password') {
      setStep('code');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            {step !== 'email' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-gray-400 hover:text-white p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {step === 'email' ? 'Reset Password' : 
             step === 'code' ? 'Enter Verification Code' : 'Set New Password'}
          </DialogTitle>
        </DialogHeader>

        {step === 'email' ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-brand-green/20 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-brand-green" />
              </div>
              <p className="text-gray-400">
                Enter your email address and we'll send you a verification code
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-gray-300">
                Email Address
              </Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>

            <Button
              onClick={handleSendCode}
              disabled={isLoading || cooldown > 0}
              className="w-full bg-brand-green hover:bg-brand-green/90 text-black"
            >
              {isLoading ? 'Sending...' : cooldown > 0 ? `Wait ${cooldown}s` : 'Send Verification Code'}
            </Button>
          </div>
        ) : step === 'code' ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-400 mb-2">
                Enter the 6-digit code sent to
              </p>
              <p className="font-medium text-white">{email}</p>
              <p className="text-sm text-gray-500 mt-2">
                Attempts remaining: {8 - attempts}
              </p>
            </div>

            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center bg-gray-800 border-gray-600 text-white text-lg font-mono"
                />
              ))}
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleVerifyCode}
                className="w-full bg-brand-green hover:bg-brand-green/90 text-black"
              >
                Verify Code
              </Button>

              <Button
                variant="outline"
                onClick={handleRequestNewCode}
                disabled={cooldown > 0 || isLoading}
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                {cooldown > 0 ? (
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Request New Code ({cooldown}s)
                  </span>
                ) : (
                  'Request New Code'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-400 mb-2">
                Enter your new password
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-gray-300">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
              />
              <p className="text-sm text-gray-500">
                Password must be at least 6 characters long
              </p>
            </div>

            <Button
              onClick={handleResetPassword}
              disabled={isLoading}
              className="w-full bg-brand-green hover:bg-brand-green/90 text-black"
            >
              {isLoading ? 'Updating Password...' : 'Reset Password'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;