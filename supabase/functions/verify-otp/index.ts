import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RequestSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
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
    const { email, code, type } = RequestSchema.parse(rawData);

    console.log(`Verifying OTP for ${email}, type: ${type}`);

    // Find valid OTP
    const { data: otpRecords, error: fetchError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('type', type)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("Error fetching OTP:", fetchError);
      throw fetchError;
    }

    if (!otpRecords || otpRecords.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid verification code found. Please request a new code." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const otpRecord = otpRecords[0];

    // Verify code matches
    if (otpRecord.code !== code) {
      return new Response(
        JSON.stringify({ error: "Invalid verification code. Please try again." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Mark OTP as verified
    await supabase
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    console.log("OTP verified successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Email verified successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-otp function:", error);
    
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
