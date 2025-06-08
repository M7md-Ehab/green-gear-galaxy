
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
                Vlitrix was born from a simple yet powerful vision: to revolutionize the world through innovative technology. Our founders, driven by an unwavering passion for excellence, believed that groundbreaking gaming and vending solutions could transform how people interact with entertainment and commerce.
              </p>
              <p className="text-gray-300 mt-3">
                What began as an ambitious dream in a small workshop has evolved into a globally recognized brand that sets new standards in the gaming machine industry. Our commitment to pushing technological boundaries while maintaining the highest quality standards has made Vlitrix synonymous with innovation and reliability.
              </p>
              <p className="text-gray-300 mt-3">
                Today, we continue to pioneer new technologies that not only meet current market demands but anticipate future needs. Our machines represent the perfect fusion of cutting-edge engineering, sleek design, and unparalleled performance that our customers have come to expect from the Vlitrix brand.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Our Mission</h2>
              <p className="text-gray-300">
                At Vlitrix, we are dedicated to transforming the gaming and entertainment landscape through revolutionary technology. We believe that exceptional gaming experiences should be accessible to everyone, everywhere. Our mission drives us to create products that not only entertain but also inspire connections between people and technology in meaningful ways.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Core Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-brand-green mb-2">Innovation</h3>
                  <p className="text-gray-300">
                    We constantly push the boundaries of what's possible, creating technology that sets new industry standards and shapes the future of gaming entertainment.
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-brand-green mb-2">Excellence</h3>
                  <p className="text-gray-300">
                    Every Vlitrix product embodies our commitment to superior craftsmanship, from initial concept through manufacturing to customer delivery and support.
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-brand-green mb-2">Sustainability</h3>
                  <p className="text-gray-300">
                    We design products built to last, using eco-friendly materials and processes that minimize environmental impact while maximizing longevity.
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-brand-green mb-2">Customer Focus</h3>
                  <p className="text-gray-300">
                    Our customers inspire everything we do. We listen, learn, and continuously evolve our products to exceed expectations and deliver extraordinary experiences.
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Our Products</h2>
              <p className="text-gray-300">
                Vlitrix offers an comprehensive range of premium gaming and vending machines designed for businesses looking to enhance their customer experience:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-300 mt-2">
                <li><strong>T Series:</strong> Advanced vending solutions featuring smart technology and seamless user interfaces for modern retail environments.</li>
                <li><strong>S Series:</strong> Compact yet powerful gaming machines perfect for venues with space constraints but high entertainment demands.</li>
                <li><strong>X Series:</strong> Next-generation experimental platforms showcasing breakthrough technologies and innovative gameplay mechanics.</li>
                <li><strong>K Series:</strong> Professional-grade claw machines engineered for high-traffic arcade environments with maximum durability.</li>
                <li><strong>N Series:</strong> Specialized gaming solutions designed for niche markets and unique entertainment applications.</li>
                <li><strong>L Series:</strong> Luxury gaming machines that combine premium materials with exceptional performance for upscale venues.</li>
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
