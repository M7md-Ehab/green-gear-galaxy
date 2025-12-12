import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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

    // Send email notification for all status changes
    if (oldStatus !== status) {
      let emailSubject = "";
      let emailBody = "";
      let emailType = status;
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
      emailSubject = `${statusInfo.title} ${statusInfo.emoji} - Order #${order.order_code}`;
      
      emailBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #00ff94 0%, #00cc75 100%); padding: 30px; text-align: center;">
                      <h1 style="color: #000; margin: 0; font-size: 28px;">${statusInfo.title} ${statusInfo.emoji}</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px;">
                      <div style="background: #f8f9fa; border-left: 4px solid #00ff94; padding: 15px 20px; border-radius: 4px; margin-bottom: 20px;">
                        <p style="margin: 0; color: #666; font-size: 13px; text-transform: uppercase;">Order Number</p>
                        <p style="margin: 5px 0 0 0; color: #000; font-size: 24px; font-weight: 700;">#${order.order_code}</p>
                      </div>
                      
                      <p style="color: #333; font-size: 16px; margin: 0 0 15px 0;">Hi <strong>${customerName}</strong>,</p>
                      <p style="color: #666; font-size: 15px; line-height: 24px; margin: 0 0 20px 0;">${statusInfo.message}</p>
                      
                      <div style="background: #f0f0f0; padding: 15px; border-radius: 6px; text-align: center;">
                        <p style="margin: 0; color: #666; font-size: 14px;">Current Status</p>
                        <p style="margin: 5px 0 0 0; color: #000; font-size: 18px; font-weight: 600; text-transform: capitalize;">${status}</p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #1a1a1a; padding: 20px; text-align: center;">
                      <p style="color: #ffffff; font-size: 14px; margin: 0 0 5px 0;">Thank you for shopping with Mehab!</p>
                      <p style="color: #999; font-size: 12px; margin: 0;">Questions? Reply to this email or contact our support.</p>
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
        await supabase.functions.invoke("send-email", {
          body: {
            to: order.user_email,
            subject: emailSubject,
            html: emailBody,
          },
        });

        // Log email activity
        await supabase.from("email_activity").insert({
          order_code: order.order_code,
          email_type: `status_${emailType}`,
          recipient_email: order.user_email,
          subject: emailSubject,
          status: "sent"
        });

        console.log(`${emailType} email sent to:`, order.user_email);
      } catch (error) {
        console.error("Failed to send status update email:", error);
        
        // Log failed email attempt
        await supabase.from("email_activity").insert({
          order_code: order.order_code,
          email_type: `status_${emailType}`,
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
