import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function ok(data: unknown): Response {
  return new Response(JSON.stringify({ code: "SUCCESS", data }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function fail(msg: string, code = 500): Response {
  return new Response(JSON.stringify({ code: "FAIL", message: msg }), {
    status: code,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Try fetching live gold price from metals-api or fallback to goldapi
    const goldApiKey = Deno.env.get("GOLD_API_KEY");

    let pricePerOz = 3350.00; // fallback realistic price
    let pricePerGram = pricePerOz / 31.1035;
    let source = "fallback";
    let timestamp = new Date().toISOString();

    if (goldApiKey) {
      try {
        const res = await fetch("https://www.goldapi.io/api/XAU/USD", {
          headers: {
            "x-access-token": goldApiKey,
            "Content-Type": "application/json",
          },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.price) {
            pricePerOz = Number(json.price);
            pricePerGram = pricePerOz / 31.1035;
            source = "goldapi.io";
            timestamp = new Date(json.timestamp * 1000).toISOString();
          }
        }
      } catch (_e) {
        // fall through to fallback
      }
    }

    // Simulate small random fluctuation for demo realism when using fallback
    if (source === "fallback") {
      const fluctuation = (Math.random() - 0.5) * 10;
      pricePerOz = 3350.00 + fluctuation;
      pricePerGram = pricePerOz / 31.1035;
    }

    return ok({
      pricePerOz: Number(pricePerOz.toFixed(4)),
      pricePerGram: Number(pricePerGram.toFixed(4)),
      currency: "USD",
      purity: "24K (99.99%)",
      source,
      timestamp,
      processingFeeRate: 0.015,
    });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Failed to fetch gold price");
  }
});
