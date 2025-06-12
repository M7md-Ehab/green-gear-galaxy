
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">About Vlitrix</h1>
          
          <div className="bg-gray-900/50 rounded-lg p-6 space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4">Our Story</h2>
              <p className="text-gray-300">
                Vlitrix was founded with a revolutionary vision: to change the world through innovative technology that empowers people to earn money in simple, accessible ways. We believed that everyone deserves the opportunity to generate income without having to rely on traditional employment or, worse, having to beg for financial support.
              </p>
              <p className="text-gray-300 mt-3">
                Our mission began when we witnessed countless individuals struggling to make ends meet, often forced into desperate situations just to survive. We knew technology could be the solution – creating opportunities for people to earn through entertainment, commerce, and smart automation that works for everyone.
              </p>
              <p className="text-gray-300 mt-3">
                What started as a small team of passionate innovators has grown into a global company that helps business owners and entrepreneurs create income streams through our advanced gaming and vending solutions. Our machines don't just entertain – they create economic opportunities that help people stop relying on handouts and start building their financial independence.
              </p>
              <p className="text-gray-300 mt-3">
                Today, Vlitrix continues to pioneer technologies that transform lives. Every machine we create is designed with one core principle: helping people get money in an easy, dignified way so they never have to beg again. Through our innovations, we're not just changing the entertainment industry – we're changing lives and communities around the world.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Our Mission</h2>
              <p className="text-gray-300">
                At Vlitrix, we are dedicated to transforming lives through technology that creates real economic opportunities. We believe that everyone deserves access to legitimate ways to earn money, and our gaming and vending solutions provide exactly that. Our mission drives us to eliminate financial desperation by creating systems that help people generate income through entertainment and commerce, ensuring no one has to resort to begging or charity to survive.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Core Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-brand-green mb-2">Innovation</h3>
                  <p className="text-gray-300">
                    We constantly push the boundaries of what's possible, creating technology that not only entertains but also provides real income opportunities for entrepreneurs and business owners.
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-brand-green mb-2">Economic Empowerment</h3>
                  <p className="text-gray-300">
                    Every Vlitrix product is designed to help people earn money in dignified ways, creating sustainable income streams that eliminate the need for financial desperation.
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-brand-green mb-2">Accessibility</h3>
                  <p className="text-gray-300">
                    We make our technology accessible to everyone, ensuring that people from all backgrounds can use our solutions to improve their financial situation.
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-brand-green mb-2">Social Impact</h3>
                  <p className="text-gray-300">
                    We measure our success by the positive impact we create in communities, helping people transition from financial dependency to financial independence.
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Our Products</h2>
              <p className="text-gray-300">
                Vlitrix offers a comprehensive range of premium gaming and vending machines designed to help business owners create profitable income streams while providing entertainment to their customers:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-300 mt-2">
                <li><strong>T Series:</strong> Advanced vending solutions featuring smart technology that maximizes profitability for business owners while serving customers efficiently.</li>
                <li><strong>S Series:</strong> Compact yet powerful gaming machines perfect for small businesses looking to add profitable entertainment options to their locations.</li>
                <li><strong>X Series:</strong> Next-generation platforms showcasing breakthrough technologies that provide the highest earning potential for operators.</li>
                <li><strong>K Series:</strong> Professional-grade claw machines engineered for maximum durability and consistent revenue generation in high-traffic locations.</li>
                <li><strong>N Series:</strong> Specialized gaming solutions designed for niche markets, helping entrepreneurs tap into unique earning opportunities.</li>
                <li><strong>L Series:</strong> Luxury gaming machines that combine premium appeal with exceptional profit margins for upscale venues and locations.</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
