import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { FeedbackForm } from '@/components/FeedbackForm';

const Feedback = () => {
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
          
          <FeedbackForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Feedback;
