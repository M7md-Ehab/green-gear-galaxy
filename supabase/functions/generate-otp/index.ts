import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RequestSchema = z.object({
  email: z.string().email(),
  type: z.enum(['signup', 'signin', 'recovery']),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const rawData = await req.json();
    const { email, type } = RequestSchema.parse(rawData);

    console.log(`Generating OTP for ${email}, type: ${type}`);

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Invalidate any existing OTPs for this email and type
    await supabase
      .from('otp_codes')
      .update({ verified: true })
      .eq('email', email)
      .eq('type', type)
      .eq('verified', false);

    // Store new OTP
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({
        email,
        code,
        type,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      throw insertError;
    }

    // Send email with OTP
    const emailSubject = type === 'signup' 
      ? 'Your Sign Up Verification Code'
      : type === 'signin'
      ? 'Your Sign In Verification Code'
      : 'Your Password Reset Code';

    const emailHtml = `
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
                <tr>
                  <td style="background: linear-gradient(135deg, #00ff94 0%, #00cc75 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: #000000; margin: 0; font-size: 28px; font-weight: 700;">Verification Code</h1>
                    <p style="color: #1a1a1a; margin: 10px 0 0 0; font-size: 16px;">${emailSubject}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <p style="color: #333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                      Your verification code is:
                    </p>
                    <div style="background: #f8f9fa; border-left: 4px solid #00ff94; padding: 20px; border-radius: 4px; text-align: center; margin: 20px 0;">
                      <p style="margin: 0; color: #000; font-size: 36px; font-weight: 700; letter-spacing: 8px;">${code}</p>
                    </div>
                    <p style="color: #666; font-size: 14px; line-height: 22px; margin: 20px 0 0 0;">
                      This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #1a1a1a; padding: 20px; text-align: center;">
                    <p style="color: #999; font-size: 13px; margin: 0;">Mehab - Your trusted e-commerce platform</p>
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
          to: email,
          subject: emailSubject,
          html: emailHtml,
        },
      });
      console.log("OTP email sent successfully");
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      throw new Error("Failed to send verification code. Please try again.");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Verification code sent to your email" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in generate-otp function:", error);
    
    const status = error instanceof z.ZodError ? 400 : 500;
    const message = error instanceof z.ZodError 
      ? `Validation error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      : error.message || "Internal server error";
    
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
