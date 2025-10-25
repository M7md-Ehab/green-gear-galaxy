
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Mail, Phone, MapPin } from 'lucide-react';

// Contact form validation schema
const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  subject: z.string().trim().min(5, 'Subject must be at least 5 characters').max(200, 'Subject must be less than 200 characters'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters')
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  });

  const handleSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate form submission - will be connected to database once contacts table is ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Message sent successfully! We will get back to you soon.');
      form.reset();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="bg-gray-900/50 rounded-lg p-6 space-y-6 md:col-span-1">
              <h2 className="text-xl font-bold mb-4">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Mail className="text-brand-green h-6 w-6 mt-1" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-gray-300 mt-1">mehab882011@gmail.com</p>
                    <p className="text-gray-300">support@vlitrix.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Phone className="text-brand-green h-6 w-6 mt-1" />
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-gray-300 mt-1">+1 (234) 567-8901</p>
                    <p className="text-gray-300">+1 (234) 567-8902</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <MapPin className="text-brand-green h-6 w-6 mt-1" />
                  <div>
                    <h3 className="font-medium">Address</h3>
                    <p className="text-gray-300 mt-1">
                      123 Tech Boulevard<br />
                      Suite 500<br />
                      San Francisco, CA 94107<br />
                      United States
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-6 mt-6">
                <h3 className="font-medium mb-2">Business Hours</h3>
                <p className="text-gray-300">Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p className="text-gray-300">Saturday: 10:00 AM - 4:00 PM</p>
                <p className="text-gray-300">Sunday: Closed</p>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="bg-gray-900/50 rounded-lg p-6 md:col-span-2">
              <h2 className="text-xl font-bold mb-4">Send Us a Message</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-gray-800 border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" className="bg-gray-800 border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800 border-gray-700" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={6} className="bg-gray-800 border-gray-700 resize-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-brand-green hover:bg-brand-green/90 text-black"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
          
          {/* Map */}
          <div className="mt-8 bg-gray-900/50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Our Location</h2>
            <div className="aspect-[16/9] bg-gray-800 rounded-lg w-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <p>Map View</p>
                <p className="text-sm">Interactive map would be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
