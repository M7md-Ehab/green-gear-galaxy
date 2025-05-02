
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useCart } from '@/hooks/use-cart';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const checkoutSchema = z.object({
  firstName: z.string().min(2, { message: 'First name is required' }),
  lastName: z.string().min(2, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(6, { message: 'Please enter a valid phone number' }),
  address: z.string().min(10, { message: 'Please enter your full address' }),
  city: z.string().min(2, { message: 'City is required' }),
  notes: z.string().optional(),
  paymentMethod: z.enum(['online', 'cod']),
  cardNumber: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      notes: '',
      paymentMethod: 'online',
      cardNumber: '',
    },
  });

  const watchPaymentMethod = form.watch('paymentMethod');

  const onSubmit = (data: CheckoutFormValues) => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    // Validate card number for online payment
    if (data.paymentMethod === 'online' && (!data.cardNumber || data.cardNumber.trim().length < 16)) {
      toast.error('Please enter a valid card number');
      return;
    }
    
    setIsProcessing(true);
    
    // Here you would normally send the order to your backend
    const orderData = { 
      ...data, 
      items: items.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })),
      total: cartTotal()
    };
    
    console.log('Order data:', orderData);
    
    // Send confirmation email (simulated)
    const sendEmail = () => {
      console.log('Sending email to mohamed.ehab.work0@gmail.com with order details');
      console.log('Email subject: New order from ' + data.firstName + ' ' + data.lastName);
      console.log('Email body includes order details and customer information');
      
      // Also send email to customer
      console.log(`Sending confirmation email to ${data.email}`);
      console.log(`Email subject: Your order confirmation from Mehab`);
      console.log(`Email body includes: Thank you for your order, order details, delivery information`);
    };
    
    // If online payment is selected
    if (data.paymentMethod === 'online') {
      // Simulate API call to Paymob
      toast.info('Processing your payment with Paymob...');
      setTimeout(() => {
        // In a real implementation, you'd use the Paymob API here
        // For the demo, we'll just simulate success
        setIsProcessing(false);
        clearCart();
        
        // Send confirmation email
        sendEmail();
        
        toast.success('Payment successful!');
        navigate('/checkout/success');
      }, 2000);
    } else {
      // For cash on delivery
      setTimeout(() => {
        setIsProcessing(false);
        clearCart();
        
        // Send confirmation email
        sendEmail();
        
        toast.success('Order placed successfully!');
        navigate('/checkout/success');
      }, 2000);
    }
  };
  
  if (items.length === 0 && !isProcessing) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900/50 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+20 123456789" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter your full shipping address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Cairo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Special instructions for delivery" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
                            >
                              <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <RadioGroupItem value="online" id="online" />
                                <label htmlFor="online" className="w-full cursor-pointer">
                                  <div>
                                    <span className="font-medium">Online Payment</span>
                                    <p className="text-sm text-gray-400 mt-1">Pay securely with Paymob</p>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="bg-white text-black text-xs px-2 py-1 rounded">Visa</span>
                                    <span className="bg-white text-black text-xs px-2 py-1 rounded">MasterCard</span>
                                    <span className="bg-white text-black text-xs px-2 py-1 rounded">Meeza</span>
                                    <span className="bg-white text-black text-xs px-2 py-1 rounded">Credit/Debit</span>
                                  </div>
                                </label>
                              </div>
                              
                              <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <RadioGroupItem value="cod" id="cod" />
                                <label htmlFor="cod" className="w-full cursor-pointer">
                                  <div>
                                    <span className="font-medium">Cash on Delivery</span>
                                    <p className="text-sm text-gray-400 mt-1">Pay with cash when you receive your order</p>
                                  </div>
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Card details for online payment */}
                    {watchPaymentMethod === 'online' && (
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Card Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="1234 5678 9012 3456" 
                                className="bg-gray-800 border-gray-700"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                            <p className="text-xs text-gray-400 mt-1">
                              Enter your card number for Paymob to process the payment.
                            </p>
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="w-full bg-brand-green hover:bg-brand-green/90 text-black"
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processing...' : watchPaymentMethod === 'online' ? 'Pay Now' : 'Place Order'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900/50 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  {/* Product List */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span>
                          {item.quantity} x {item.product.name}
                        </span>
                        <span>{(item.product.price * item.quantity).toLocaleString()} EGP</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-700 pt-4 flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span>{cartTotal().toLocaleString()} EGP</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipping</span>
                    <span>Free</span>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-4 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-lg">{cartTotal().toLocaleString()} EGP</span>
                  </div>
                </div>
                
                <div className="rounded-md bg-gray-800 p-4">
                  <h3 className="font-medium mb-2">Payment Security</h3>
                  <p className="text-sm text-gray-400 mb-2">
                    All transactions are secured and encrypted by Paymob, Egypt's leading payment service provider.
                  </p>
                  <div className="flex items-center space-x-2 mt-3">
                    <div className="bg-white p-1 rounded">
                      <div className="text-black text-xs font-bold">PAYMOB</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
