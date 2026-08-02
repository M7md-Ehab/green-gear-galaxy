import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { emailLayout, BRAND } from "../_shared/email-layout.ts";

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

    const otpBoxed = otpCode.split('').join('&nbsp;&nbsp;');

    const emailHtml = emailLayout({
      eyebrow: label,
      title: 'Your verification code',
      subtitle: 'Use the code below to continue. It is valid for 10 minutes and can only be used once.',
      preheader: `${otpCode} is your Vlitrix verification code`,
      content: `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #E6E6E6;border-left:3px solid ${BRAND.green};background-color:#FAFAFA;">
          <tr>
            <td align="center" style="padding:26px 20px;">
              <p style="margin:0 0 10px;color:#8A8A8A;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Verification code</p>
              <p style="margin:0;color:#111111;font-size:34px;font-weight:700;letter-spacing:6px;font-family:'SF Mono',Menlo,Consolas,monospace;">${otpBoxed}</p>
            </td>
          </tr>
        </table>
        <div style="height:24px;"></div>
        <p style="margin:0;color:#4A4A4A;font-size:14px;line-height:22px;">This code expires in <strong style="color:#111111;">10 minutes</strong>. If you did not request it, you can safely ignore this email &mdash; no changes will be made to your account.</p>
      `,
    });

    // Send email via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
      body: JSON.stringify({
        from: 'Vlitrix <onboarding@resend.dev>',
        to: [email],
        subject: `${otpCode} is your Vlitrix verification code`,
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
