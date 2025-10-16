import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderRequest {
  user_email: string;
  user_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  payment_method: string;
  notes?: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const orderData: OrderRequest = await req.json();

    console.log("Creating order for:", orderData.user_email);

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: orderData.user_id || null,
        user_email: orderData.user_email,
        total: orderData.total,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw orderError;
    }

    console.log("Order created:", order);

    // Create order items
    const orderItems = orderData.items.map((item) => ({
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
    const adminEmail = "mehab882011@gmail.com";
    const orderCode = order.order_code;

    // Prepare order details for email
    const orderDetailsText = orderData.items
      .map((item) => `${item.product_name} × ${item.quantity} - $${item.price.toFixed(2)}`)
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
      <p><strong>Total:</strong> $${orderData.total.toFixed(2)}</p>
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
      <p><strong>Total:</strong> $${orderData.total.toFixed(2)}</p>
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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
