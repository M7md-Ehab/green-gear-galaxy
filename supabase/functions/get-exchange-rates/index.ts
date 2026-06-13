import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SYMBOLS = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'JPY', 'CNY', 'EGP'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  let rates: Record<string, number> | null = null;
  let source = 'static';

  try {
    const apiKey = Deno.env.get('CURRENCYFREAKS_API_KEY');
    if (apiKey) {
      const r = await fetch(
        `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${apiKey}&symbols=${SYMBOLS.join(',')}`
      );
      if (r.ok) {
        const data = await r.json();
        // Free tier returns USD base. Rebase to EGP: rate_EGP(X) = rate_USD(X) / rate_USD(EGP)
        if (data?.rates?.EGP) {
          const usdToEgp = parseFloat(data.rates.EGP);
          if (usdToEgp > 0) {
            rates = { EGP: 1 };
            for (const sym of SYMBOLS) {
              if (sym === 'EGP') continue;
              const v = parseFloat(data.rates[sym]);
              if (!isNaN(v)) rates[sym] = v / usdToEgp;
            }
            source = 'currencyfreaks';
          }
        }
      } else {
        console.error('CurrencyFreaks failed:', r.status, await r.text());
      }
    }
  } catch (e) {
    console.error('CurrencyFreaks error:', e);
  }

  if (!rates) {
    try {
      const r = await fetch(`https://api.exchangerate.host/latest?base=EGP&symbols=${SYMBOLS.filter(s => s !== 'EGP').join(',')}`);
      if (r.ok) {
        const data = await r.json();
        if (data?.rates) { rates = { EGP: 1, ...data.rates }; source = 'exchangerate.host'; }
      }
    } catch (_) {}
  }

  if (!rates) {
    rates = { EGP: 1, USD: 0.01926, EUR: 0.01665, GBP: 0.01436, SAR: 0.07227, AED: 0.07073, JPY: 3.085, CNY: 0.13022 };
  }

  return new Response(JSON.stringify({ rates, source, updatedAt: new Date().toISOString() }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
