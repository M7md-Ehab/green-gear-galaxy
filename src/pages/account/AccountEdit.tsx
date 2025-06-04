
import { useNavigate } from 'react-router-dom';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/hooks/use-firebase-auth';
import ProfileForm from './components/ProfileForm';
import LoadingSpinner from './components/LoadingSpinner';

const AccountEdit = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading } = useAuth();
  
  // Check if logged in
  if (!isLoggedIn && !isLoading) {
    navigate('/auth');
    return null;
  }

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom max-w-lg mx-auto">
          <h1 className="text-4xl font-bold mb-8 gradient-text">Edit Profile</h1>
          
          <div className="bg-gray-900/50 rounded-lg p-6 tech-border">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <ProfileForm onCancel={handleCancel} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountEdit;
