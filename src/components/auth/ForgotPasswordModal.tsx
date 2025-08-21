import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/use-supabase-auth';
import { toast } from 'sonner';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps) => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();

  // Generate random 6-digit code for simulation
  const [verificationCode] = useState(() => 
    Math.floor(100000 + Math.random() * 900000).toString()
  );

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
      await resetPassword(email);
      setStep('code');
      setAttempts(0);
      setCooldown(60);
      toast.success(`Verification code sent to ${email}`);
      console.log('Verification code for demo:', verificationCode);
    } catch (error) {
      toast.error('Failed to send verification code');
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

    setAttempts(prev => prev + 1);

    if (enteredCode === verificationCode) {
      toast.success('Code verified! Password reset email sent.');
      handleClose();
    } else {
      if (attempts + 1 >= 8) {
        toast.error('Too many failed attempts. New code sent.');
        setAttempts(0);
        setCooldown(60);
        setCode(['', '', '', '', '', '']);
        // Generate new code
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('New verification code for demo:', newCode);
      } else {
        toast.error(`Invalid code. ${8 - (attempts + 1)} attempts remaining.`);
        setCode(['', '', '', '', '', '']);
        const firstInput = document.getElementById('code-0');
        firstInput?.focus();
      }
    }
  };

  const handleRequestNewCode = () => {
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown} seconds before requesting a new code`);
      return;
    }
    
    setCooldown(60);
    setAttempts(0);
    setCode(['', '', '', '', '', '']);
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('New verification code for demo:', newCode);
    toast.success('New verification code sent!');
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setCode(['', '', '', '', '', '']);
    setAttempts(0);
    setCooldown(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            {step === 'code' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('email')}
                className="text-gray-400 hover:text-white p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {step === 'email' ? 'Reset Password' : 'Enter Verification Code'}
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
        ) : (
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
                disabled={cooldown > 0}
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;