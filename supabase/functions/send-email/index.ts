import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const EmailRequestSchema = z.object({
  to: z.string().email().max(255),
  subject: z.string().trim().min(1).max(200),
  html: z.string().min(1).max(100000)
});

interface EmailRequest extends z.infer<typeof EmailRequestSchema> {}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    console.log("Email request received:", { to: rawData.to, subject: rawData.subject });
    
    const emailRequest = EmailRequestSchema.parse(rawData);

    // Use Resend's default sender for unverified domains
    // Once domain is verified, change to your custom domain
    const fromEmail = "Mehab <onboarding@resend.dev>";

    console.log("Sending email from:", fromEmail, "to:", emailRequest.to);

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [emailRequest.to],
      subject: emailRequest.subject,
      html: emailRequest.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    
    let status = 500;
    let message = "Failed to send email";
    
    if (error instanceof z.ZodError) {
      status = 400;
      message = `Validation error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
    } else if (error.message) {
      message = error.message;
    }
    
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
