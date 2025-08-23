import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SendOTPRequest = await req.json();
    
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Rate limiting check: prevent too many OTP requests
    const { data: recentOTP, error: fetchError } = await supabase
      .from('password_reset_otps')
      .select('created_at')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!fetchError && recentOTP && recentOTP.length > 0) {
      const lastOTPTime = new Date(recentOTP[0].created_at).getTime();
      const now = Date.now();
      const cooldownPeriod = 60 * 1000; // 60 seconds cooldown

      if (now - lastOTPTime < cooldownPeriod) {
        return new Response(JSON.stringify({ 
          error: "Please wait before requesting another code",
          retryAfter: Math.ceil((cooldownPeriod - (now - lastOTPTime)) / 1000)
        }), {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    // Check daily limit (5 OTPs per email per day)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { data: dailyOTPs, error: dailyCheckError } = await supabase
      .from('password_reset_otps')
      .select('id')
      .eq('email', email)
      .gte('created_at', dayAgo.toISOString());

    if (!dailyCheckError && dailyOTPs && dailyOTPs.length >= 5) {
      return new Response(JSON.stringify({ 
        error: "Daily limit reached. Please try again tomorrow." 
      }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Clean up any existing OTPs for this email
    await supabase
      .from('password_reset_otps')
      .delete()
      .eq('email', email);

    // Store OTP in database
    const { error: dbError } = await supabase
      .from('password_reset_otps')
      .insert({
        email,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        attempts: 0
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to store OTP" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Send email with OTP - fixed sender for security
    const emailResponse = await resend.emails.send({
      from: "Password Reset <noreply@resend.dev>",
      to: [email],
      subject: "Password Reset Code - Vlitrix",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
          <p style="color: #666; font-size: 16px;">Hello,</p>
          <p style="color: #666; font-size: 16px;">You requested a password reset for your Vlitrix account. Please use the following code to reset your password:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h2 style="color: #333; font-size: 32px; letter-spacing: 8px; margin: 0;">${otpCode}</h2>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this password reset, please ignore this email.</p>
          <p style="color: #666; font-size: 14px;">Best regards,<br>The Vlitrix Team</p>
        </div>
      `,
    });

    console.log("OTP email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, message: "OTP sent successfully" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
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