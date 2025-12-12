import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProfileForm from './components/ProfileForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AccountEdit = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-8 md:py-12">
        <div className="container-custom max-w-2xl mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6 text-gray-400 hover:text-white -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Edit Profile</h1>
            <p className="text-gray-400">Manage your account settings and preferences</p>
          </div>
          
          <ProfileForm onCancel={handleCancel} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountEdit;
