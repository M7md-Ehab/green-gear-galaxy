import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { emailLayout, statPanel, infoBlock, button, BRAND } from "../_shared/email-layout.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema with new status options
const UpdateOrderRequestSchema = z.object({
  order_id: z.string().uuid(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'postponed', 'declined', 'cancelled', 'finished'])
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
    console.log("Received request data:", rawData);
    
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

    console.log("Found order:", order);
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

    console.log("Order updated successfully from", oldStatus, "to", status);

    // Send email notification for all status changes
    if (oldStatus !== status) {
      const customerName = order.customer_name || "Valued Customer";

      const statusMessages: Record<string, { emoji: string; title: string; message: string }> = {
        pending: {
          emoji: "⏳",
          title: "Order Pending",
          message: "Your order is pending and will be processed soon."
        },
        processing: {
          emoji: "🔄",
          title: "Order Processing",
          message: "Great news! Your order is now being processed."
        },
        shipped: {
          emoji: "🚚",
          title: "Your Order is on the Way!",
          message: "Your order has been shipped and is on its way to you. You can expect delivery within the next few days."
        },
        delivered: {
          emoji: "📦",
          title: "Your Order Has Been Delivered!",
          message: "Your order has been successfully delivered. We hope you enjoy your purchase!"
        },
        postponed: {
          emoji: "⏸️",
          title: "Order Postponed",
          message: "Your order has been postponed. We will update you soon with more information. We apologize for any inconvenience."
        },
        declined: {
          emoji: "❌",
          title: "Order Declined",
          message: "Unfortunately, we were unable to process your order. Please contact our support team for more information."
        },
        cancelled: {
          emoji: "🚫",
          title: "Order Cancelled",
          message: "Your order has been cancelled. If you did not request this cancellation, please contact our support team."
        },
        finished: {
          emoji: "✅",
          title: "Order Complete",
          message: "Your order has been completed. We hope you're satisfied with your purchase! We'd love to hear your feedback."
        }
      };

      const statusInfo = statusMessages[status] || statusMessages.pending;
      const emailSubject = `${statusInfo.title} — Vlitrix order #${order.order_code}`;

      const emailBody = emailLayout({
        eyebrow: "Order update",
        title: statusInfo.title,
        subtitle: statusInfo.message,
        preheader: `Order #${order.order_code}: ${status}`,
        content: `
          <p style="margin:0 0 24px;color:#4A4A4A;font-size:15px;line-height:24px;">Hi <strong style="color:#111111;">${customerName}</strong>,</p>
          ${statPanel("Order number", `#${order.order_code}`)}
          <div style="height:16px;"></div>
          ${infoBlock("Current status", `<span style="color:#111111;font-weight:600;text-transform:capitalize;">${status}</span>`)}
          <div style="height:28px;"></div>
          ${button("View order details", `${BRAND.site}/dashboard`)}
        `,
      });

      try {
        console.log("Sending status update email to:", order.user_email);
        
        const emailResult = await resend.emails.send({
          from: "Vlitrix <onboarding@resend.dev>",
          to: [order.user_email],
          subject: emailSubject,
          html: emailBody,
        });

        console.log("Email sent successfully:", emailResult);

        // Log email activity
        await supabase.from("email_activity").insert({
          order_code: order.order_code,
          email_type: `status_${status}`,
          recipient_email: order.user_email,
          subject: emailSubject,
          status: "sent"
        });

        console.log("Email activity logged successfully");
      } catch (emailError: any) {
        console.error("Failed to send status update email:", emailError);
        
        // Log failed email attempt
        await supabase.from("email_activity").insert({
          order_code: order.order_code,
          email_type: `status_${status}`,
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
