import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';

interface OtpVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onVerificationSuccess?: () => void;
}

export function OtpVerificationModal({ open, onOpenChange, email, onVerificationSuccess }: OtpVerificationModalProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { verifyOtp, resendOtp } = useAuth();

  // Cooldown timer for resend button (3 minutes = 180 seconds)
  useEffect(() => {
    if (open && cooldown === 0) {
      setCooldown(180);
    }
  }, [open]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      return;
    }

    setLoading(true);
    const { error } = await verifyOtp(email, otp);
    
    if (!error) {
      // Close modal and reset state
      setOtp('');
      setCooldown(0);
      onOpenChange(false);
      
      // Call success callback if provided
      if (onVerificationSuccess) {
        onVerificationSuccess();
      }
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    setResending(true);
    const { error } = await resendOtp(email);
    
    if (!error) {
      setCooldown(180); // Reset to 3 minutes
      setOtp('');
    }
    setResending(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Verify your email</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter the 6-digit code sent to {email}
            <br />
            <span className="text-xs text-gray-500 mt-1">Code expires in 10 minutes</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-4">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            pattern={REGEXP_ONLY_DIGITS}
            onComplete={handleVerify}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="bg-gray-800 border-gray-700 text-white" />
              <InputOTPSlot index={1} className="bg-gray-800 border-gray-700 text-white" />
              <InputOTPSlot index={2} className="bg-gray-800 border-gray-700 text-white" />
              <InputOTPSlot index={3} className="bg-gray-800 border-gray-700 text-white" />
              <InputOTPSlot index={4} className="bg-gray-800 border-gray-700 text-white" />
              <InputOTPSlot index={5} className="bg-gray-800 border-gray-700 text-white" />
            </InputOTPGroup>
          </InputOTP>

          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={handleVerify}
              disabled={otp.length !== 6 || loading}
              className="w-full bg-brand-green hover:bg-brand-green/90 text-black"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <Button
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              variant="ghost"
              className="w-full text-brand-green hover:text-brand-green/90 disabled:opacity-50"
            >
              {resending ? 'Sending...' : cooldown > 0 ? `Resend code (${formatTime(cooldown)})` : 'Resend Code'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
