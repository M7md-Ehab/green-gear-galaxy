import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type } = await req.json();

    if (!email || !type) {
      return new Response(
        JSON.stringify({ error: 'Email and type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Reliable existence check against auth.users
    const { data: existsData } = await supabase.rpc('user_exists_by_email', { _email: email });
    const userExists = existsData === true;

    if ((type === 'login' || type === 'verify_identity') && !userExists) {
      return new Response(JSON.stringify({ error: 'No account found with this email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (type === 'signup' && userExists) {
      return new Response(JSON.stringify({ error: 'An account already exists with this email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (type === 'email_change' && userExists) {
      return new Response(JSON.stringify({ error: 'This email is already in use' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete existing OTPs
    await supabase.from('pending_otps').delete().eq('email', email).eq('otp_type', type);

    // Store OTP with 10 minute expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error: insertError } = await supabase.from('pending_otps').insert({
      email, otp_code: otpCode, otp_type: type, expires_at: expiresAt,
    });

    if (insertError) {
      console.error('Insert OTP error:', insertError);
      throw new Error('Failed to store OTP');
    }

    // Build email
    const typeLabels: Record<string, string> = {
      signup: 'Sign Up', login: 'Login', email_change: 'Email Verification', verify_identity: 'Identity Verification',
    };
    const label = typeLabels[type] || 'Verification';

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 460px; max-width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #00ff94 0%, #00cc75 100%); padding: 32px 40px; text-align: center;">
              <h1 style="color: #000000; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">VLITRIX</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1a1a1a; margin: 0 0 8px; font-size: 22px; font-weight: 700; text-align: center;">${label} Code</h2>
              <p style="color: #666666; font-size: 15px; text-align: center; margin: 0 0 32px; line-height: 22px;">Enter this code to verify your identity</p>
              
              <!-- OTP Code -->
              <div style="text-align: center; margin: 0 0 32px;">
                <div style="display: inline-block; background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 12px; padding: 20px 40px;">
                  <span style="font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #000000; font-family: 'SF Mono', 'Fira Code', monospace;">${otpCode}</span>
                </div>
              </div>
              
              <div style="background: #fff8e1; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
                <p style="color: #f57c00; font-size: 13px; margin: 0; text-align: center;">⏱ This code expires in <strong>10 minutes</strong></p>
              </div>
              
              <p style="color: #999999; font-size: 13px; text-align: center; margin: 0; line-height: 20px;">
                If you didn't request this code, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 20px 40px; text-align: center;">
              <p style="color: #888888; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Vlitrix. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Send email via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
      body: JSON.stringify({
        from: 'Vlitrix <onboarding@resend.dev>',
        to: [email],
        subject: `${otpCode} is your Vlitrix ${label.toLowerCase()} code`,
        html: emailHtml,
      }),
    });

    if (!resendRes.ok) {
      const resendError = await resendRes.text();
      console.error('Resend error:', resendError);
      throw new Error('Failed to send email');
    }

    // Log OTP email
    try {
      await supabase.from('email_activity').insert({
        order_code: 0,
        email_type: `otp_${type}`,
        recipient_email: email,
        subject: `${label} Code`,
        status: 'sent',
      });
    } catch (logErr) {
      console.error('Failed to log OTP email:', logErr);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Verification code sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('send-otp error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
