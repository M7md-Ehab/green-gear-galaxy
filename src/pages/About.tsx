
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
                Vlitrix was founded in 2020 with a singular vision: to create cutting-edge technology that seamlessly integrates into everyday life. Our team of engineers, designers, and technology enthusiasts shared a passion for innovation and a belief that premium technology should be accessible to everyone.
              </p>
              <p className="text-gray-300 mt-3">
                What started in a small workshop has grown into an internationally recognized brand known for exceptional performance, durability, and design. Today, Vlitrix continues to push boundaries and set new standards in the industry.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Our Mission</h2>
              <p className="text-gray-300">
                Our mission at Vlitrix is to empower people through technology. We believe in creating products that enhance productivity, creativity, and connectivity. Through continuous innovation and customer-centric design, we strive to deliver solutions that make a meaningful impact on how people work, create, and connect.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Core Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-brand-green mb-2">Innovation</h3>
                  <p className="text-gray-300">
                    We constantly explore new ideas, technologies, and approaches to create products that exceed expectations and set new industry standards.
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-brand-green mb-2">Quality</h3>
                  <p className="text-gray-300">
                    We are committed to excellence in every aspect of our business, from product design and manufacturing to customer service and support.
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-brand-green mb-2">Sustainability</h3>
                  <p className="text-gray-300">
                    We design products with longevity in mind, using sustainable materials and processes to minimize our environmental impact.
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-brand-green mb-2">Customer Focus</h3>
                  <p className="text-gray-300">
                    We listen to our customers, anticipate their needs, and continually improve our products and services to deliver exceptional experiences.
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Our Products</h2>
              <p className="text-gray-300">
                Vlitrix offers a diverse range of high-performance machines designed for professionals, creators, and technology enthusiasts. Our product lines include:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-300 mt-2">
                <li><strong>T Series:</strong> Premium performance workstations for professionals who need maximum power and reliability.</li>
                <li><strong>S Series:</strong> Sleek, lightweight machines designed for creators and mobile professionals who value portability without compromising on performance.</li>
                <li><strong>X Series:</strong> Cutting-edge experimental products that showcase the future of technology with innovative features and designs.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Leadership Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div className="text-center">
                  <div className="bg-gray-800 h-32 w-32 rounded-full mx-auto mb-4"></div>
                  <h3 className="font-bold">Sarah Chen</h3>
                  <p className="text-gray-400 text-sm">CEO & Co-Founder</p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-800 h-32 w-32 rounded-full mx-auto mb-4"></div>
                  <h3 className="font-bold">David Rodriguez</h3>
                  <p className="text-gray-400 text-sm">CTO & Co-Founder</p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-800 h-32 w-32 rounded-full mx-auto mb-4"></div>
                  <h3 className="font-bold">Michael Park</h3>
                  <p className="text-gray-400 text-sm">Chief Design Officer</p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Join Our Journey</h2>
              <p className="text-gray-300">
                At Vlitrix, we're always looking for talented individuals who share our passion for technology and innovation. If you're interested in joining our team, please visit our careers page or contact us at careers@vlitrix.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
