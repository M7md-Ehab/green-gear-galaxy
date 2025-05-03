
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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

    // Send email to customer
    const customerEmailResponse = await sendEmail({
      to: orderData.email,
      from: "order@mehab.com",
      fromName: "Mehab Company",
      subject: "Your Mehab Order Confirmation",
      html: customerEmailHTML
    });
    
    // Send email to admin
    const adminEmailResponse = await sendEmail({
      to: "mehab882011@gmail.com",
      from: "orders@mehab.com",
      fromName: "Mehab Orders",
      subject: `New Order from ${orderData.firstName} ${orderData.lastName}`,
      html: adminEmailHTML
    });

    return new Response(
      JSON.stringify({ message: "Emails sent successfully" }),
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

async function sendEmail({
  to,
  from,
  fromName,
  subject,
  html
}: {
  to: string;
  from: string;
  fromName: string;
  subject: string;
  html: string;
}) {
  // This is a simplified email sending function
  // In a production environment, you would use a service like Resend, SendGrid, etc.
  console.log(`Sending email to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`From: ${fromName} <${from}>`);
  
  // For now, we'll just log the email content
  // In a real implementation, replace this with actual email sending code
  return { success: true };
}

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
          <p>Thank you for your order with Mehab Company. Your order has been received and is being processed.</p>
          
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
            Mehab Company
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
