import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const UpdateOrderRequestSchema = z.object({
  order_id: z.string().uuid(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'finished'])
});

interface UpdateOrderRequest extends z.infer<typeof UpdateOrderRequestSchema> {}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const rawData = await req.json();
    const { order_id, status } = UpdateOrderRequestSchema.parse(rawData);

    console.log("Updating order:", order_id, "to status:", status);

    // Get order details before updating
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("order_code, user_email, customer_name, status")
      .eq("id", order_id)
      .single();

    if (fetchError || !order) {
      console.error("Error fetching order:", fetchError);
      throw new Error("Order not found");
    }

    const oldStatus = order.status;

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", order_id);

    if (updateError) {
      console.error("Error updating order:", updateError);
      throw updateError;
    }

    console.log("Order updated successfully");

    // Send email notification if status changed to shipped, delivered, or finished
    if ((status === "shipped" || status === "delivered" || status === "finished") && oldStatus !== status) {
      let emailSubject = "";
      let emailBody = "";
      let emailType = "";
      const customerName = order.customer_name || "Valued Customer";

      if (status === "shipped") {
        emailType = "shipped";
        emailSubject = `Your Order is on the Way 🚚 - #${order.order_code}`;
        emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #00ff94 0%, #00cc75 100%); padding: 20px; text-align: center;">
              <h1 style="color: #000; margin: 0;">Your Order is on the Way! 🚚</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <p>Hi ${customerName},</p>
              <p>Good news! Your order <strong>#${order.order_code}</strong> has been shipped and is on its way to you.</p>
              <p>You can expect delivery within the next few days.</p>
              <p>Thank you for choosing Mehab!</p>
            </div>
            <div style="background: #333; color: #fff; padding: 15px; text-align: center; font-size: 12px;">
              <p>Thank you for shopping with Mehab!</p>
            </div>
          </div>
        `;
      } else if (status === "delivered") {
        emailType = "delivered";
        emailSubject = `Your Order Has Been Delivered 📦 - #${order.order_code}`;
        emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #00ff94 0%, #00cc75 100%); padding: 20px; text-align: center;">
              <h1 style="color: #000; margin: 0;">Your Order Has Been Delivered! 📦</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <p>Hi ${customerName},</p>
              <p>Your order <strong>#${order.order_code}</strong> has been successfully delivered.</p>
              <p>We hope you enjoy your purchase!</p>
              <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
            </div>
            <div style="background: #333; color: #fff; padding: 15px; text-align: center; font-size: 12px;">
              <p>Thank you for shopping with Mehab!</p>
            </div>
          </div>
        `;
      } else if (status === "finished") {
        emailType = "finished";
        emailSubject = `Your Order Is Complete ✅ - #${order.order_code}`;
        emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #00ff94 0%, #00cc75 100%); padding: 20px; text-align: center;">
              <h1 style="color: #000; margin: 0;">Order Complete ✅</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <p>Hi ${customerName},</p>
              <p>Your order <strong>#${order.order_code}</strong> has been completed.</p>
              <p>We hope you're satisfied with your purchase!</p>
              <p>We'd love to hear your feedback about your experience with Mehab.</p>
            </div>
            <div style="background: #333; color: #fff; padding: 15px; text-align: center; font-size: 12px;">
              <p>Thank you for shopping with Mehab!</p>
            </div>
          </div>
        `;
      }

      try {
        await supabase.functions.invoke("send-email", {
          body: {
            to: order.user_email,
            subject: emailSubject,
            html: emailBody,
          },
        });

        // Log email activity
        await supabase.from("email_activity").insert({
          order_id: order_id,
          order_code: order.order_code,
          email_type: emailType,
          recipient_email: order.user_email,
          subject: emailSubject,
          status: "sent"
        });

        console.log(`${emailType} email sent to:`, order.user_email);
      } catch (error) {
        console.error("Failed to send status update email:", error);
        
        // Log failed email attempt
        await supabase.from("email_activity").insert({
          order_id: order_id,
          order_code: order.order_code,
          email_type: emailType,
          recipient_email: order.user_email,
          subject: emailSubject,
          status: "failed"
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in update-order-status function:", error);
    
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
