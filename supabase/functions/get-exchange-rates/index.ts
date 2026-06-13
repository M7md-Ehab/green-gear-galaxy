import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SYMBOLS = 'USD,EUR,GBP,SAR,AED,JPY,CNY';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('CURRENCYFREAKS_API_KEY');
    let rates: Record<string, number> | null = null;
    let source = 'static';

    if (apiKey) {
      try {
        const r = await fetch(
          `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${apiKey}&symbols=${SYMBOLS}&base=EGP`
        );
        if (r.ok) {
          const data = await r.json();
          if (data.rates) {
            rates = { EGP: 1 };
            for (const [k, v] of Object.entries(data.rates)) {
              rates[k] = parseFloat(v as string);
            }
            source = 'currencyfreaks';
          }
        }
      } catch (_) { /* fall through */ }
    }

    if (!rates) {
      try {
        const r = await fetch(`https://api.exchangerate.host/latest?base=EGP&symbols=${SYMBOLS}`);
        if (r.ok) {
          const data = await r.json();
          if (data.rates) {
            rates = { EGP: 1, ...data.rates };
            source = 'exchangerate.host';
          }
        }
      } catch (_) { /* fall through */ }
    }

    if (!rates) {
      rates = { EGP: 1, USD: 0.0203, EUR: 0.0187, GBP: 0.0161, SAR: 0.0762, AED: 0.0747, JPY: 3.06, CNY: 0.148 };
    }

    return new Response(JSON.stringify({ rates, source, updatedAt: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
