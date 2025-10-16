import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdateOrderRequest {
  order_id: string;
  status: "pending" | "shipped" | "finished";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { order_id, status }: UpdateOrderRequest = await req.json();

    console.log("Updating order:", order_id, "to status:", status);

    // Get order details before updating
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("order_code, user_email, status")
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

    // Send email notification if status changed to shipped or finished
    if ((status === "shipped" || status === "finished") && oldStatus !== status) {
      let emailSubject = "";
      let emailBody = "";

      if (status === "shipped") {
        emailSubject = `Your Order #${order.order_code} Has Been Shipped`;
        emailBody = `
          <h2>Order Shipped — #${order.order_code}</h2>
          <p>Good news! Your order #${order.order_code} has been shipped.</p>
          <p>It should arrive within the next few days.</p>
          <p>Thank you for shopping with Mehab!</p>
        `;
      } else if (status === "finished") {
        emailSubject = `Your Order #${order.order_code} Is Now Complete`;
        emailBody = `
          <h2>Order Complete — #${order.order_code}</h2>
          <p>Your order #${order.order_code} has been completed.</p>
          <p>We hope you enjoy your purchase!</p>
          <p>Thank you for shopping with Mehab!</p>
        `;
      }

      await supabase.functions.invoke("send-email", {
        body: {
          to: order.user_email,
          subject: emailSubject,
          html: emailBody,
        },
      });

      console.log("Status update email sent to:", order.user_email);
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
