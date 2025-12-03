import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { FeedbackForm } from '@/components/FeedbackForm';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

const Feedback = () => {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">We Value Your Feedback</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Your thoughts help us improve. Share your experience, suggestions, or any concerns you may have.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
            </div>
          ) : user ? (
            <FeedbackForm />
          ) : (
            <Card className="w-full max-w-md mx-auto bg-gray-900 border-gray-800">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Sign In Required</CardTitle>
                <CardDescription className="text-gray-400">
                  Please sign in to submit your feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-center">
                  We require you to be signed in so we can follow up on your feedback and provide better support.
                </p>
                <div className="flex flex-col gap-3">
                  <Link to="/login">
                    <Button className="w-full bg-brand-green hover:bg-brand-green/90 text-black">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                  <p className="text-center text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-brand-green hover:underline">
                      Sign up
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Feedback;
