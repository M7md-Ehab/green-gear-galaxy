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
    const { email, otp, type, user_id } = await req.json();
    // type: 'signup' | 'login' | 'email_change' | 'verify_identity'

    if (!email || !otp || !type) {
      return new Response(
        JSON.stringify({ error: 'Email, OTP, and type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find matching OTP
    const { data: otpRecord } = await supabase
      .from('pending_otps')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .eq('otp_type', type)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    if (!otpRecord) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired verification code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark OTP as verified
    await supabase
      .from('pending_otps')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    // Clean up expired OTPs
    await supabase
      .from('pending_otps')
      .delete()
      .lt('expires_at', new Date().toISOString());

    // Handle signup
    if (type === 'signup') {
      // Create the user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
      });

      if (createError) {
        console.error('Create user error:', createError);
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate a magic link token for session creation
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
      });

      if (linkError) {
        console.error('Generate link error:', linkError);
        return new Response(
          JSON.stringify({ error: 'Account created but failed to generate session' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          token_hash: linkData.properties.hashed_token,
          verification_type: 'magiclink',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle login
    if (type === 'login') {
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
      });

      if (linkError) {
        console.error('Generate link error:', linkError);
        return new Response(
          JSON.stringify({ error: 'Failed to create session' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          token_hash: linkData.properties.hashed_token,
          verification_type: 'magiclink',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle verify_identity (user is already logged in, just verify)
    if (type === 'verify_identity') {
      return new Response(
        JSON.stringify({ success: true, verified: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle email_change
    if (type === 'email_change') {
      if (!user_id) {
        return new Response(
          JSON.stringify({ error: 'User ID is required for email change' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update user email via admin API
      const { error: updateError } = await supabase.auth.admin.updateUserById(user_id, {
        email,
        email_confirm: true,
      });

      if (updateError) {
        console.error('Update user email error:', updateError);
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update profiles table
      await supabase
        .from('profiles')
        .update({ email })
        .eq('id', user_id);

      return new Response(
        JSON.stringify({ success: true, verified: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('verify-custom-otp error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
