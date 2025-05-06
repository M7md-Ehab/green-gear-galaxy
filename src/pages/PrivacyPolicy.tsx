
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
          
          <div className="bg-gray-900/50 rounded-lg p-6 space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4">Privacy at Vlitrix</h2>
              <p className="text-gray-300">
                At Vlitrix, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
              <p className="text-gray-300 mt-3">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Information We Collect</h2>
              <p className="text-gray-300">
                We collect information about you in various ways when you use our website and services:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-300 mt-2">
                <li><strong>Personal Information:</strong> Name, email address, phone number, shipping address, and payment information when you make a purchase or create an account.</li>
                <li><strong>Usage Data:</strong> Information about how you use our website, including pages visited, time spent, and actions taken.</li>
                <li><strong>Device Information:</strong> Information about your device, including IP address, browser type, operating system, and other technical details.</li>
                <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar technologies to track activity on our website and hold certain information.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">How We Use Your Information</h2>
              <p className="text-gray-300">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-300 mt-2">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders, products, and services</li>
                <li>Improve our website and customer service</li>
                <li>Personalize your experience and deliver content relevant to your interests</li>
                <li>Administer promotions, surveys, or other site features</li>
                <li>Send periodic emails regarding your orders or other products and services</li>
                <li>Protect against unauthorized access to our systems and data</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Information Sharing</h2>
              <p className="text-gray-300">
                We may share your information with:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-300 mt-2">
                <li><strong>Service Providers:</strong> Companies that perform services for us, such as payment processing, shipping, and customer service.</li>
                <li><strong>Business Partners:</strong> Companies with whom we collaborate to offer products or services.</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights or the rights of others.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Your Rights</h2>
              <p className="text-gray-300">
                You have the right to:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-300 mt-2">
                <li>Access and update your personal information</li>
                <li>Request that we delete your personal information</li>
                <li>Object to the processing of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Security</h2>
              <p className="text-gray-300">
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage.
              </p>
              <p className="text-gray-300 mt-3">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Changes to This Policy</h2>
              <p className="text-gray-300">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Contact Us</h2>
              <p className="text-gray-300">
                If you have any questions about this Privacy Policy, please contact us at privacy@vlitrix.com or call our customer service at +1-234-567-8901.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
