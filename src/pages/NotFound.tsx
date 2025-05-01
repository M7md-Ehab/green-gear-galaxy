
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12 flex items-center">
        <div className="container-custom max-w-md mx-auto text-center">
          <h1 className="text-9xl font-bold text-brand-green mb-2">404</h1>
          <h2 className="text-2xl font-medium mb-6">Page Not Found</h2>
          <p className="text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild className="bg-brand-green hover:bg-brand-green/90 text-black">
              <Link to="/">Return Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
