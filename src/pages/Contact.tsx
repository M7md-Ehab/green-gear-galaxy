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

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      // Try to send email notification but don't fail if it doesn't work
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            to: 'mehab882011@gmail.com',
            subject: `New Feedback from ${data.name}`,
            title: `New feedback from ${data.name}`,
            eyebrow: 'Internal notification',
            subtitle: 'A new message was submitted through the Vlitrix contact form.',
            html: `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #E6E6E6;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 8px;color:#111111;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Sender</p>
                    <p style="margin:0;color:#4A4A4A;font-size:14px;line-height:22px;">${data.name}<br>${data.email}</p>
                  </td>
                </tr>
              </table>
              <div style="height:16px;"></div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #E6E6E6;border-left:3px solid #00FF84;background-color:#FAFAFA;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 8px;color:#111111;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Message</p>
                    <p style="margin:0;color:#4A4A4A;font-size:14px;line-height:22px;">${data.message}</p>
                  </td>
                </tr>
              </table>
            `
          }
        });
      } catch (emailError) {
        console.log('Email notification failed (non-blocking):', emailError);
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
