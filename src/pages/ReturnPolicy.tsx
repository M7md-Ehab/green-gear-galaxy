
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Return Policy</h1>
          
          <div className="bg-gray-900/50 rounded-lg p-6 space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4">Our Return Policy</h2>
              <p className="text-gray-300">
                At Vlitrix, we stand behind the quality of our products. We want you to be completely satisfied with your purchase. If for any reason you're not satisfied, we've made our return process simple and convenient.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Return Period</h2>
              <p className="text-gray-300">
                You have 30 days from the date of delivery to return your product. After 30 days, we cannot offer you a refund or exchange.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Return Conditions</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li>Items must be returned in their original packaging</li>
                <li>Products must be unused and in the same condition that you received them</li>
                <li>All accessories, manuals, and documentation must be included</li>
                <li>Products must include the original receipt or proof of purchase</li>
                <li>Software products with a broken seal are non-returnable</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">How to Return</h2>
              <p className="text-gray-300">
                To initiate a return, please contact our customer service team. They will guide you through the return process and provide you with a Return Authorization (RA) number. Returns sent without prior authorization will not be accepted.
              </p>
              <p className="text-gray-300 mt-3">
                Please note that you will be responsible for paying the shipping costs for returning the item. Shipping costs are non-refundable.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Refunds</h2>
              <p className="text-gray-300">
                Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
              </p>
              <p className="text-gray-300 mt-3">
                If approved, your refund will be processed and a credit will automatically be applied to your credit card or original method of payment within 14 business days.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Exchanges</h2>
              <p className="text-gray-300">
                We only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an email at support@vlitrix.com.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Contact Us</h2>
              <p className="text-gray-300">
                If you have any questions about our return policy, please contact us at support@vlitrix.com or call our customer service at +1-234-567-8901.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReturnPolicy;
