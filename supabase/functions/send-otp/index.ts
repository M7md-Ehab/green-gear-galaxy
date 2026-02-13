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
    // type: 'signup' | 'login' | 'email_change' | 'verify_identity'

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

    // For login/verify_identity, check user exists via profiles
    if (type === 'login' || type === 'verify_identity') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (!profile) {
        return new Response(
          JSON.stringify({ error: 'No account found with this email' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // For signup, check user doesn't already exist
    if (type === 'signup') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (profile) {
        return new Response(
          JSON.stringify({ error: 'An account already exists with this email' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // For email_change, check new email not already in use
    if (type === 'email_change') {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingProfile) {
        return new Response(
          JSON.stringify({ error: 'This email is already in use' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTPs for this email and type
    await supabase
      .from('pending_otps')
      .delete()
      .eq('email', email)
      .eq('otp_type', type);

    // Store OTP with 10 minute expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error: insertError } = await supabase
      .from('pending_otps')
      .insert({
        email,
        otp_code: otpCode,
        otp_type: type,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error('Insert OTP error:', insertError);
      throw new Error('Failed to store OTP');
    }

    // Build email content
    const emailSubject = type === 'signup' ? 'Your Vlitrix Signup Code'
      : type === 'login' ? 'Your Vlitrix Login Code'
      : type === 'email_change' ? 'Verify Your New Email'
      : 'Your Verification Code';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background-color: #000000; color: #ffffff;">
        <h1 style="color: #00FF88; text-align: center; margin-bottom: 10px; font-size: 28px;">Vlitrix</h1>
        <h2 style="text-align: center; margin-bottom: 30px; font-size: 20px; color: #ffffff;">${emailSubject}</h2>
        <p style="text-align: center; color: #999999; font-size: 14px;">Your verification code is:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #00FF88; background: #1a1a1a; padding: 16px 32px; border-radius: 12px; display: inline-block;">${otpCode}</span>
        </div>
        <p style="text-align: center; color: #666666; font-size: 14px;">This code expires in 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #333333; margin: 30px 0;" />
        <p style="text-align: center; color: #666666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `;

    // Send email via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Vlitrix <onboarding@resend.dev>',
        to: [email],
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    if (!resendRes.ok) {
      const resendError = await resendRes.text();
      console.error('Resend error:', resendError);
      throw new Error('Failed to send email');
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
