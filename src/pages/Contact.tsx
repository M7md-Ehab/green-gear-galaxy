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
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

const feedbackSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000)
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const Contact = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: '',
      email: user?.email || '',
      message: ''
    }
  });

  const handleSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    
    try {
      // Save feedback to database
      const { error: dbError } = await supabase
        .from('feedback')
        .insert({
          name: data.name,
          email: data.email,
          message: data.message,
          user_id: user?.id || null,
          status: 'pending'
        });

      if (dbError) throw dbError;

      // Send email notification to admin
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'mehab882011@gmail.com',
          subject: `New Feedback from ${data.name}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 40px 0;">
                    <table style="width: 600px; max-width: 100%; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      <tr>
                        <td style="background: linear-gradient(135deg, #00ff94 0%, #00cc75 100%); padding: 30px; text-align: center;">
                          <h1 style="color: #000; margin: 0; font-size: 24px;">New Feedback Received</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 30px;">
                          <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;"><strong>From:</strong> ${data.name}</p>
                            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;"><strong>Email:</strong> ${data.email}</p>
                            <p style="margin: 0; color: #666; font-size: 14px;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                          </div>
                          <h3 style="color: #333; margin: 0 0 15px 0;">Message:</h3>
                          <p style="color: #555; line-height: 1.6; margin: 0; white-space: pre-wrap;">${data.message}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background: #1a1a1a; padding: 20px; text-align: center;">
                          <p style="color: #888; margin: 0; font-size: 12px;">Mehab Admin Panel</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        }
      });

      if (emailError) {
        console.error('Failed to send admin notification:', emailError);
      }
      
      toast.success('Thank you for your feedback! We will get back to you soon.');
      form.reset();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to send feedback. Please try again.');
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
            
            {/* Feedback Form */}
            <div className="bg-gray-900/50 rounded-lg p-6 md:col-span-2">
              <h2 className="text-xl font-bold mb-4">Send Us Your Feedback</h2>
              
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
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Feedback</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={6} 
                            className="bg-gray-800 border-gray-700 resize-none"
                            placeholder="Share your thoughts, suggestions, or concerns..."
                          />
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
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Feedback
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
