import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: orderData.user_id || null,
        user_email: orderData.user_email,
        customer_name: orderData.customer_name,
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
      await supabase.functions.invoke("send-email", {
        body: {
          to: adminEmail,
          subject: `New Order Received — #${orderCode}`,
          html: adminEmailHtml,
        },
      });

      // Log admin email
      await supabase.from("email_activity").insert({
        order_id: order.id,
        order_code: orderCode,
        email_type: "admin_notification",
        recipient_email: adminEmail,
        subject: `New Order Received — #${orderCode}`,
        status: "sent"
      });

      console.log("Admin email sent");
    } catch (error) {
      console.error("Failed to send admin email:", error);
    }

    // Email to customer with professional styling
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #00ff94 0%, #00cc75 100%); padding: 20px; text-align: center;">
          <h1 style="color: #000; margin: 0;">Thank You for Your Order!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <p>Hi ${orderData.customer_name},</p>
          <p>Thank you for shopping with Mehab! Your order <strong>#${orderCode}</strong> has been received and is being processed.</p>
          <p><strong>Your Order Code:</strong> ${orderCode}</p>
          <p style="font-size: 12px; color: #666;">Please save this code for tracking your order.</p>
          <h3 style="color: #333;">Order Summary:</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            ${orderItemsTable}
            <tr style="font-weight: bold; font-size: 16px;">
              <td colspan="2" style="padding: 15px 10px;">Total:</td>
              <td style="padding: 15px 10px; text-align: right;">$${calculatedTotal.toFixed(2)}</td>
            </tr>
          </table>
          <p><strong>Delivery Address:</strong><br>${orderData.customer_address}, ${orderData.customer_city}</p>
          <p>We'll send you another email when your order ships.</p>
        </div>
        <div style="background: #333; color: #fff; padding: 15px; text-align: center; font-size: 12px;">
          <p>Thank you for shopping with Mehab!</p>
          <p>Questions? Contact us at ${adminEmail}</p>
        </div>
      </div>
    `;

    try {
      await supabase.functions.invoke("send-email", {
        body: {
          to: orderData.user_email,
          subject: `Order Confirmation — #${orderCode}`,
          html: customerEmailHtml,
        },
      });

      // Log customer email
      await supabase.from("email_activity").insert({
        order_id: order.id,
        order_code: orderCode,
        email_type: "order_confirmation",
        recipient_email: orderData.user_email,
        subject: `Order Confirmation — #${orderCode}`,
        status: "sent"
      });

      console.log("Customer email sent");
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
