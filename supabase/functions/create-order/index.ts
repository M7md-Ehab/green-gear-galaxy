import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { Resend } from "npm:resend@2.0.0";
import { emailLayout, statPanel, infoBlock, itemsTable, button, BRAND } from "../_shared/email-layout.ts";

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

    // Prepare order items for email
    const emailItems = validatedItems.map((item) => ({
      name: item.product_name,
      quantity: item.quantity,
      price: Number(item.price),
    }));

    const paymentLabel =
      orderData.payment_method === "cod" ? "Cash on delivery" : "Online payment";

    const deliveryHtml = `
      <strong style="color:#111111;">${orderData.customer_name}</strong><br>
      ${orderData.customer_phone}<br>
      ${orderData.customer_address}<br>
      ${orderData.customer_city}
    `;

    // ---------- Admin notification ----------
    const adminSubject = `New order #${orderCode} — ${orderData.customer_name}`;
    const adminEmailHtml = emailLayout({
      eyebrow: "Internal notification",
      title: `New order #${orderCode}`,
      subtitle: `${orderData.customer_name} placed an order for $${calculatedTotal.toFixed(2)}.`,
      preheader: `New Vlitrix order #${orderCode}`,
      footerNote: "Vlitrix internal order notification.",
      content: `
        ${statPanel("Order number", `#${orderCode}`)}
        <div style="height:24px;"></div>
        ${itemsTable(emailItems, calculatedTotal)}
        <div style="height:28px;"></div>
        ${infoBlock(
          "Customer",
          `${deliveryHtml}<br>${orderData.user_email}`,
        )}
        <div style="height:16px;"></div>
        ${infoBlock(
          "Payment",
          `${paymentLabel}${orderData.notes ? `<br><br><strong style="color:#111111;">Note:</strong> ${orderData.notes}` : ""}`,
        )}
      `,
    });

    try {
      const adminEmailResult = await resend.emails.send({
        from: "Vlitrix <onboarding@resend.dev>",
        to: [adminEmail],
        subject: adminSubject,
        html: adminEmailHtml,
      });

      console.log("Admin email sent:", adminEmailResult);

      await supabase.from("email_activity").insert({
        order_code: orderCode,
        email_type: "admin_notification",
        recipient_email: adminEmail,
        subject: adminSubject,
        status: "sent"
      });
    } catch (error) {
      console.error("Failed to send admin email:", error);
    }

    // ---------- Customer confirmation ----------
    const customerSubject = `Your Vlitrix order #${orderCode} is confirmed`;
    const customerEmailHtml = emailLayout({
      eyebrow: "Order confirmation",
      title: `Thank you, ${orderData.customer_name.split(" ")[0]}.`,
      subtitle:
        "We have received your order and it is now being prepared. You will get an update the moment its status changes.",
      preheader: `Order #${orderCode} confirmed — total $${calculatedTotal.toFixed(2)}`,
      contactEmail: adminEmail,
      content: `
        ${statPanel("Order number", `#${orderCode}`)}
        <div style="height:28px;"></div>
        <p style="margin:0 0 16px;color:#111111;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Order summary</p>
        ${itemsTable(emailItems, calculatedTotal)}
        <div style="height:28px;"></div>
        ${infoBlock("Delivery details", deliveryHtml)}
        <div style="height:16px;"></div>
        ${infoBlock(
          "Payment method",
          `${paymentLabel}${orderData.notes ? `<br><br><strong style="color:#111111;">Your note:</strong> ${orderData.notes}` : ""}`,
        )}
        <div style="height:28px;"></div>
        ${button("View your orders", `${BRAND.site}/dashboard`)}
      `,
    });

    try {
      const customerEmailResult = await resend.emails.send({
        from: "Vlitrix <onboarding@resend.dev>",
        to: [orderData.user_email],
        subject: customerSubject,
        html: customerEmailHtml,
      });

      console.log("Customer email sent:", customerEmailResult);

      await supabase.from("email_activity").insert({
        order_code: orderCode,
        email_type: "order_confirmation",
        recipient_email: orderData.user_email,
        subject: customerSubject,
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
