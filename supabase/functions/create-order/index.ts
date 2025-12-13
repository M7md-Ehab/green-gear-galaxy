import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const OrderRequestSchema = z.object({
  user_id: z.string().uuid().optional().nullable(),
  user_email: z.string().email().max(255),
  customer_name: z.string().trim().min(2).max(100),
  customer_phone: z.string().trim().min(6).max(20),
  customer_address: z.string().trim().min(10).max(500),
  customer_city: z.string().trim().min(2).max(100),
  payment_method: z.enum(['online', 'cod']),
  notes: z.string().max(1000).optional(),
  items: z.array(z.object({
    product_id: z.string().min(1),
    product_name: z.string().min(1).max(200),
    quantity: z.number().int().positive().max(100),
    price: z.number().positive() // Accept price from client for products not in DB
  })).min(1).max(50),
  total: z.number().positive()
});

interface OrderRequest extends z.infer<typeof OrderRequestSchema> {}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate input
    const rawData = await req.json();
    const orderData = OrderRequestSchema.parse(rawData);

    console.log("Creating validated order for:", orderData.user_email);

    // Try to fetch products from database for validation
    const productIds = orderData.items.map(item => item.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('id, price, name, in_stock, inventory_count')
      .in('id', productIds);

    // Build order items, using DB data if available, otherwise use client data
    const validatedItems = orderData.items.map(item => {
      const dbProduct = products?.find(p => p.id === item.product_id);
      
      if (dbProduct) {
        // Product exists in database - validate and use DB price
        if (!dbProduct.in_stock || dbProduct.inventory_count < item.quantity) {
          throw new Error(`Product ${dbProduct.name} is out of stock or insufficient quantity`);
        }
        return {
          product_id: item.product_id,
          product_name: dbProduct.name,
          quantity: item.quantity,
          price: dbProduct.price
        };
      } else {
        // Product not in database - use client-provided data (for hardcoded products)
        // For hardcoded products, we don't store them in order_items with product_id
        console.log(`Product ${item.product_id} not found in DB, using client data`);
        return {
          product_id: null, // Don't store string IDs as UUIDs
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price
        };
      }
    });

    // Calculate total using validated prices
    const calculatedTotal = validatedItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    
    // Verify the total matches (allow small floating point differences)
    if (Math.abs(calculatedTotal - orderData.total) > 0.01) {
      console.warn(`Price mismatch: calculated $${calculatedTotal.toFixed(2)} but received $${orderData.total.toFixed(2)}`);
    }

    // Create order in database with all fields
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: orderData.user_id || null,
        user_email: orderData.user_email,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_address: orderData.customer_address,
        customer_city: orderData.customer_city,
        payment_method: orderData.payment_method,
        notes: orderData.notes || null,
        total: calculatedTotal, // Use server-calculated total
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw orderError;
    }

    console.log("Order created:", order);

    // Create order items with validated prices
    const orderItems = validatedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      throw itemsError;
    }

    // Send emails
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "mehab882011@gmail.com";
    const orderCode = order.order_code;

    // Prepare order items table for email
    const orderItemsTable = validatedItems
      .map((item) => 
        `<tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 10px;">${item.product_name}</td>
          <td style="padding: 10px;">× ${item.quantity}</td>
          <td style="padding: 10px; text-align: right;">$${Number(item.price).toFixed(2)}</td>
        </tr>`
      ).join('');

    // Email to admin with professional styling
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #00ff94 0%, #00cc75 100%); padding: 20px; text-align: center;">
          <h1 style="color: #000; margin: 0;">New Order Received</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Order #${orderCode}</h2>
          <p><strong>Customer Name:</strong> ${orderData.customer_name}</p>
          <p><strong>Customer Email:</strong> ${orderData.user_email}</p>
          <p><strong>Phone:</strong> ${orderData.customer_phone}</p>
          <p><strong>Address:</strong> ${orderData.customer_address}, ${orderData.customer_city}</p>
          <p><strong>Payment Method:</strong> ${orderData.payment_method}</p>
          ${orderData.notes ? `<p><strong>Notes:</strong> ${orderData.notes}</p>` : ""}
          <h3 style="color: #333;">Order Items:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${orderItemsTable}
            <tr style="font-weight: bold; font-size: 16px;">
              <td colspan="2" style="padding: 15px 10px;">Total:</td>
              <td style="padding: 15px 10px; text-align: right;">$${calculatedTotal.toFixed(2)}</td>
            </tr>
          </table>
        </div>
        <div style="background: #333; color: #fff; padding: 15px; text-align: center; font-size: 12px;">
          <p>Mehab Admin Panel</p>
        </div>
      </div>
    `;

    try {
      const adminEmailResult = await resend.emails.send({
        from: "Mehab <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `New Order Received — #${orderCode}`,
        html: adminEmailHtml,
      });

      console.log("Admin email sent:", adminEmailResult);

      // Log admin email
      await supabase.from("email_activity").insert({
        order_code: orderCode,
        email_type: "admin_notification",
        recipient_email: adminEmail,
        subject: `New Order Received — #${orderCode}`,
        status: "sent"
      });
    } catch (error) {
      console.error("Failed to send admin email:", error);
    }

    // Email to customer with professional styling
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                
                <!-- Header with Logo -->
                <tr>
                  <td style="background: linear-gradient(135deg, #00ff94 0%, #00cc75 100%); padding: 40px 20px; text-align: center;">
                    <img src="https://jmtsbdrmeohfoeibkglj.supabase.co/storage/v1/object/public/assets/logo.png" alt="Mehab Logo" style="width: 80px; height: auto; margin-bottom: 20px;" onerror="this.style.display='none'">
                    <h1 style="color: #000000; margin: 0; font-size: 28px; font-weight: 700;">Order Confirmed!</h1>
                    <p style="color: #1a1a1a; margin: 10px 0 0 0; font-size: 16px;">Thank you for your purchase</p>
                  </td>
                </tr>
                
                <!-- Order Code Badge -->
                <tr>
                  <td style="padding: 30px 40px 20px;">
                    <div style="background: #f8f9fa; border-left: 4px solid #00ff94; padding: 15px 20px; border-radius: 4px;">
                      <p style="margin: 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
                      <p style="margin: 5px 0 0 0; color: #000; font-size: 24px; font-weight: 700;">#${orderCode}</p>
                    </div>
                  </td>
                </tr>
                
                <!-- Greeting -->
                <tr>
                  <td style="padding: 0 40px;">
                    <p style="color: #333; font-size: 16px; line-height: 24px; margin: 0;">Hi <strong>${orderData.customer_name}</strong>,</p>
                    <p style="color: #666; font-size: 15px; line-height: 24px; margin: 15px 0 0 0;">Your order has been confirmed and is being processed. We'll notify you when it ships.</p>
                  </td>
                </tr>
                
                <!-- Order Items -->
                <tr>
                  <td style="padding: 30px 40px 20px;">
                    <h2 style="color: #333; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">Order Details</h2>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <thead>
                        <tr style="border-bottom: 2px solid #e0e0e0;">
                          <th style="padding: 12px 0; text-align: left; color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase;">Product</th>
                          <th style="padding: 12px 0; text-align: center; color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase;">Qty</th>
                          <th style="padding: 12px 0; text-align: right; color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase;">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${validatedItems.map(item => `
                          <tr style="border-bottom: 1px solid #f0f0f0;">
                            <td style="padding: 16px 0; color: #333; font-size: 15px;">${item.product_name}</td>
                            <td style="padding: 16px 0; text-align: center; color: #666; font-size: 15px;">× ${item.quantity}</td>
                            <td style="padding: 16px 0; text-align: right; color: #333; font-size: 15px; font-weight: 500;">$${Number(item.price).toFixed(2)}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colspan="2" style="padding: 20px 0 10px 0; text-align: left; color: #333; font-size: 17px; font-weight: 700;">Total</td>
                          <td style="padding: 20px 0 10px 0; text-align: right; color: #00cc75; font-size: 22px; font-weight: 700;">$${calculatedTotal.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </td>
                </tr>
                
                <!-- Delivery Info -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <div style="background: #fafafa; border-radius: 6px; padding: 20px;">
                      <h3 style="color: #333; font-size: 15px; font-weight: 600; margin: 0 0 12px 0;">Delivery Information</h3>
                      <p style="color: #666; font-size: 14px; line-height: 22px; margin: 0;">
                        <strong style="color: #333;">${orderData.customer_name}</strong><br>
                        ${orderData.customer_phone}<br>
                        ${orderData.customer_address}<br>
                        ${orderData.customer_city}
                      </p>
                      ${orderData.notes ? `
                        <p style="color: #666; font-size: 14px; line-height: 22px; margin: 15px 0 0 0; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                          <strong style="color: #333;">Note:</strong> ${orderData.notes}
                        </p>
                      ` : ''}
                    </div>
                  </td>
                </tr>
                
                <!-- Payment Method -->
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <p style="color: #666; font-size: 14px; margin: 0;">
                      <strong style="color: #333;">Payment Method:</strong> ${orderData.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #1a1a1a; padding: 30px 40px; text-align: center;">
                    <p style="color: #ffffff; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">Thank you for shopping with Mehab!</p>
                    <p style="color: #999; font-size: 13px; margin: 0; line-height: 20px;">
                      Questions about your order?<br>
                      Contact us at <a href="mailto:${adminEmail}" style="color: #00ff94; text-decoration: none;">${adminEmail}</a>
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      const customerEmailResult = await resend.emails.send({
        from: "Mehab <onboarding@resend.dev>",
        to: [orderData.user_email],
        subject: `Order Confirmation — #${orderCode}`,
        html: customerEmailHtml,
      });

      console.log("Customer email sent:", customerEmailResult);

      // Log customer email
      await supabase.from("email_activity").insert({
        order_code: orderCode,
        email_type: "order_confirmation",
        recipient_email: orderData.user_email,
        subject: `Order Confirmation — #${orderCode}`,
        status: "sent"
      });
    } catch (error) {
      console.error("Failed to send customer email:", error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_code: orderCode,
        order_id: order.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in create-order function:", error);
    
    // Return appropriate status code
    const status = error instanceof z.ZodError ? 400 : 500;
    const message = error instanceof z.ZodError 
      ? `Validation error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      : error.message;
    
    return new Response(
      JSON.stringify({ error: message }),
      {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
