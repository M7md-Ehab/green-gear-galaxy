
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

// Initialize Resend with API key
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  paymentMethod: string;
  items: OrderItem[];
  total: number;
  currency: string;
  currencySymbol: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderData }: { orderData: OrderData } = await req.json();

    // Prepare HTML for customer email
    const customerEmailHTML = generateCustomerEmail(orderData);
    
    // Prepare HTML for admin email
    const adminEmailHTML = generateAdminEmail(orderData);

    console.log("Sending email to customer:", orderData.email);
    
    // Send email to customer using Resend
    const customerEmailResponse = await resend.emails.send({
      from: "onboarding@resend.dev", // Use Resend's default domain during testing
      to: orderData.email,
      subject: "Your Vlitrix Order Confirmation",
      html: customerEmailHTML
    });
    
    console.log("Sending email to admin: mehab882011@gmail.com");
    
    // Send email to admin using Resend
    const adminEmailResponse = await resend.emails.send({
      from: "onboarding@resend.dev", // Use Resend's default domain during testing
      to: "mehab882011@gmail.com",
      subject: `New Order from ${orderData.firstName} ${orderData.lastName}`,
      html: adminEmailHTML
    });

    console.log("Email to customer sent successfully:", customerEmailResponse);
    console.log("Email to admin sent successfully:", adminEmailResponse);

    return new Response(
      JSON.stringify({ 
        message: "Emails sent successfully",
        customerEmail: customerEmailResponse,
        adminEmail: adminEmailResponse
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

function generateCustomerEmail(orderData: OrderData): string {
  const itemsHTML = orderData.items.map(item => 
    `<tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${orderData.currencySymbol}${item.price.toFixed(2)}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${orderData.currencySymbol}${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`
  ).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; }
          table { border-collapse: collapse; width: 100%; }
          table, th, td { border: 1px solid #ddd; }
          th, td { padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Order Confirmation</h1>
          <p>Dear ${orderData.firstName} ${orderData.lastName},</p>
          <p>Thank you for your order with Vlitrix. Your order has been received and is being processed.</p>
          
          <h2>Order Details</h2>
          <p><strong>Order ID:</strong> ${orderData.id}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          
          <h3>Items Purchased</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right; font-weight: bold;">Total:</td>
                <td style="font-weight: bold;">${orderData.currencySymbol}${orderData.total.toFixed(2)} ${orderData.currency}</td>
              </tr>
            </tfoot>
          </table>
          
          <h3>Shipping Information</h3>
          <p>
            ${orderData.address}<br>
            ${orderData.city}<br>
            Phone: ${orderData.phone}
          </p>
          
          <h3>Payment Method</h3>
          <p>${orderData.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}</p>
          
          <p>If you have any questions about your order, please contact our support team.</p>
          
          <p>
            Thank you for shopping with us!<br>
            Vlitrix
          </p>
        </div>
      </body>
    </html>
  `;
}

function generateAdminEmail(orderData: OrderData): string {
  const itemsHTML = orderData.items.map(item => 
    `<tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${orderData.currencySymbol}${item.price.toFixed(2)}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${orderData.currencySymbol}${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`
  ).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; }
          table { border-collapse: collapse; width: 100%; }
          table, th, td { border: 1px solid #ddd; }
          th, td { padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>New Order Received</h1>
          <p><strong>Customer:</strong> ${orderData.firstName} ${orderData.lastName}</p>
          <p><strong>Email:</strong> ${orderData.email}</p>
          <p><strong>Phone:</strong> ${orderData.phone}</p>
          
          <h2>Order Details</h2>
          <p><strong>Order ID:</strong> ${orderData.id}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          
          <h3>Items Ordered</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right; font-weight: bold;">Total:</td>
                <td style="font-weight: bold;">${orderData.currencySymbol}${orderData.total.toFixed(2)} ${orderData.currency}</td>
              </tr>
            </tfoot>
          </table>
          
          <h3>Shipping Information</h3>
          <p>
            ${orderData.address}<br>
            ${orderData.city}<br>
          </p>
          
          <h3>Payment Method</h3>
          <p>${orderData.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}</p>
          
          ${orderData.notes ? `<h3>Order Notes</h3><p>${orderData.notes}</p>` : ''}
        </div>
      </body>
    </html>
  `;
}
