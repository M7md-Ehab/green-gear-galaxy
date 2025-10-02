import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
}

export function OtpVerificationModal({ open, onOpenChange, email }: OtpVerificationModalProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      return;
    }

    setLoading(true);
    const { error } = await verifyOtp(email, otp);
    
    if (!error) {
      onOpenChange(false);
      navigate('/');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    await resendOtp(email);
    setOtp('');
    setResending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Verify your email</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter the 6-digit code sent to {email}
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
              disabled={resending}
              variant="ghost"
              className="w-full text-brand-green hover:text-brand-green/90"
            >
              {resending ? 'Sending...' : 'Resend Code'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
