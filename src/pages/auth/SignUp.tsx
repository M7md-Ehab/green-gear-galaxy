import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OtpVerificationModal } from '@/components/auth/OtpVerificationModal';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signUpSchema.safeParse({ email });
    
    if (!result.success) {
      const formattedErrors: { [key: string]: string } = {};
      result.error.errors.forEach((error) => {
        formattedErrors[error.path[0]] = error.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setLoading(true);
    setSendingOtp(true);
    const { error } = await signUp(email);
    setSendingOtp(false);
    
    if (!error) {
      setVerificationEmail(email);
      setShowOtpModal(true);
    } else {
      setErrors({ email: error.message || 'Failed to send code' });
    }
    setLoading(false);
  };

  return (
    <>
      <OtpVerificationModal 
        open={showOtpModal} 
        onOpenChange={setShowOtpModal}
        email={verificationEmail}
        onVerificationSuccess={() => navigate('/')}
      />
      
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-12">
        <Card className="w-full max-w-md mx-4 bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Create an account</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your email to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-brand-green hover:bg-brand-green/90 text-black"
                disabled={loading}
              >
                {sendingOtp ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    Sending verification code...
                  </span>
                ) : loading ? (
                  'Creating account...'
                ) : (
                  'Sign Up'
                )}
              </Button>

              <p className="text-center text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-green hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default SignUp;
