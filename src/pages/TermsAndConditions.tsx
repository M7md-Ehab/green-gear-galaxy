
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Terms and Conditions</h1>
          
          <div className="bg-gray-900/50 rounded-lg p-6 space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4">Welcome to Vlitrix</h2>
              <p className="text-gray-300">
                These terms and conditions outline the rules and regulations for the use of Vlitrix's website. By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use Vlitrix's website if you do not accept all of the terms and conditions stated on this page.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Intellectual Property Rights</h2>
              <p className="text-gray-300">
                Other than the content you own, which you may have opted to include on this Website, under these Terms, Vlitrix and/or its licensors own all rights to the intellectual property and material contained in this Website, and all such rights are reserved.
              </p>
              <p className="text-gray-300 mt-3">
                You are granted a limited license only for purposes of viewing the material contained on this Website.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Restrictions</h2>
              <p className="text-gray-300">
                You are specifically restricted from all of the following:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-300 mt-2">
                <li>Publishing any Website material in any other media</li>
                <li>Selling, sublicensing, and/or otherwise commercializing any Website material</li>
                <li>Publicly performing and/or showing any Website material</li>
                <li>Using this Website in any way that is or may be damaging to this Website</li>
                <li>Using this Website in any way that impacts user access to this Website</li>
                <li>Using this Website contrary to applicable laws and regulations, or in any way may cause harm to the Website, or to any person or business entity</li>
                <li>Engaging in any data mining, data harvesting, data extracting, or any other similar activity in relation to this Website</li>
                <li>Using this Website to engage in any advertising or marketing</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Your Content</h2>
              <p className="text-gray-300">
                In these Terms and Conditions, "Your Content" shall mean any audio, video, text, images, or other material you choose to display on this Website. By displaying Your Content, you grant Vlitrix a non-exclusive, worldwide, irrevocable, royalty-free, sublicensable license to use, reproduce, adapt, publish, translate, and distribute it in any and all media.
              </p>
              <p className="text-gray-300 mt-3">
                Your Content must be your own and must not infringe on any third party's rights. Vlitrix reserves the right to remove any of Your Content from this Website at any time without notice.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">No Warranties</h2>
              <p className="text-gray-300">
                This Website is provided "as is," with all faults, and Vlitrix makes no express or implied representations or warranties of any kind related to this Website or the materials contained on this Website.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Limitation of Liability</h2>
              <p className="text-gray-300">
                In no event shall Vlitrix, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this Website, whether such liability is under contract.
              </p>
              <p className="text-gray-300 mt-3">
                Vlitrix, including its officers, directors, and employees, shall not be liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this Website.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Indemnification</h2>
              <p className="text-gray-300">
                You hereby indemnify to the fullest extent Vlitrix from and against any and/or all liabilities, costs, demands, causes of action, damages, and expenses arising in any way related to your breach of any of the provisions of these Terms.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Severability</h2>
              <p className="text-gray-300">
                If any provision of these Terms is found to be invalid under any applicable law, such provisions shall be deleted without affecting the remaining provisions herein.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Variation of Terms</h2>
              <p className="text-gray-300">
                Vlitrix is permitted to revise these Terms at any time as it sees fit, and by using this Website you are expected to review these Terms on a regular basis.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">Applicable Law</h2>
              <p className="text-gray-300">
                These Terms and Conditions shall be governed by and construed in accordance with the laws of the country where Vlitrix is established, and you submit to the non-exclusive jurisdiction of those courts for the resolution of any disputes.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;
