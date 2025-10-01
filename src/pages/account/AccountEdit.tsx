import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProfileForm from './components/ProfileForm';

const AccountEdit = () => {
  const navigate = useNavigate();

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
            <ProfileForm onCancel={handleCancel} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountEdit;
