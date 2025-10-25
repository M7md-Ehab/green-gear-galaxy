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
    product_id: z.string().uuid(),
    product_name: z.string().min(1).max(200),
    quantity: z.number().int().positive().max(100)
    // Note: price is NOT accepted from client - we fetch from DB
  })).min(1).max(50),
  total: z.number().positive() // We'll validate this matches DB prices
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

    // Fetch actual product prices from database (NEVER trust client prices)
    const productIds = orderData.items.map(item => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price, name, in_stock, inventory_count')
      .in('id', productIds);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw new Error('Failed to fetch product information');
    }

    if (!products || products.length !== orderData.items.length) {
      const foundIds = products?.map(p => p.id) || [];
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      throw new Error(`Products not found in database: ${missingIds.join(', ')}`);
    }

    // Validate stock and build order items with DB prices
    const validatedItems = orderData.items.map(item => {
      const product = products.find(p => p.id === item.product_id);
      if (!product) {
        throw new Error(`Product ${item.product_name} not found in database`);
      }
      if (!product.in_stock || product.inventory_count < item.quantity) {
        throw new Error(`Product ${product.name} is out of stock or insufficient quantity`);
      }
      return {
        product_id: item.product_id,
        product_name: product.name, // Use DB name
        quantity: item.quantity,
        price: product.price // Use DB price, not client price
      };
    });

    // Calculate total using validated prices from database
    const calculatedTotal = validatedItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    
    // Verify the total matches (allow small floating point differences)
    if (Math.abs(calculatedTotal - orderData.total) > 0.01) {
      throw new Error(`Price mismatch: calculated $${calculatedTotal.toFixed(2)} but received $${orderData.total.toFixed(2)}`);
    }

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: orderData.user_id || null,
        user_email: orderData.user_email,
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

    // Prepare order details for email
    const orderDetailsText = validatedItems
      .map((item) => `${item.product_name} × ${item.quantity} - $${Number(item.price).toFixed(2)}`)
      .join("\n");

    // Email to admin
    const adminEmailHtml = `
      <h2>New Order Received — #${orderCode}</h2>
      <p><strong>Order Code:</strong> ${orderCode}</p>
      <p><strong>Customer Email:</strong> ${orderData.user_email}</p>
      <p><strong>Customer Name:</strong> ${orderData.customer_name}</p>
      <p><strong>Phone:</strong> ${orderData.customer_phone}</p>
      <p><strong>Address:</strong> ${orderData.customer_address}, ${orderData.customer_city}</p>
      <p><strong>Payment Method:</strong> ${orderData.payment_method}</p>
      ${orderData.notes ? `<p><strong>Notes:</strong> ${orderData.notes}</p>` : ""}
      <h3>Order Details:</h3>
      <pre>${orderDetailsText}</pre>
      <p><strong>Total:</strong> $${calculatedTotal.toFixed(2)}</p>
    `;

    await supabase.functions.invoke("send-email", {
      body: {
        to: adminEmail,
        subject: `New Order Received — #${orderCode}`,
        html: adminEmailHtml,
      },
    });

    console.log("Admin email sent");

    // Email to customer
    const customerEmailHtml = `
      <h2>Order Confirmation — #${orderCode}</h2>
      <p>Dear ${orderData.customer_name},</p>
      <p>Thank you for your order! We have received your order and it is being processed.</p>
      <p><strong>Your Order Code:</strong> ${orderCode}</p>
      <p>Please save this code for tracking your order.</p>
      <h3>Order Summary:</h3>
      <pre>${orderDetailsText}</pre>
      <p><strong>Total:</strong> $${calculatedTotal.toFixed(2)}</p>
      <p><strong>Delivery Address:</strong> ${orderData.customer_address}, ${orderData.customer_city}</p>
      <p>We will send you an email when your order has been shipped or completed.</p>
      <p>Thank you for shopping with Mehab!</p>
    `;

    await supabase.functions.invoke("send-email", {
      body: {
        to: orderData.user_email,
        subject: `Order Confirmation — #${orderCode}`,
        html: customerEmailHtml,
      },
    });

    console.log("Customer email sent");

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
