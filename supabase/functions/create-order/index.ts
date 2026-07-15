import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@19.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function ok(data: unknown): Response {
  return new Response(JSON.stringify({ code: "SUCCESS", data }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function fail(msg: string, code = 400): Response {
  return new Response(JSON.stringify({ code: "FAIL", message: msg }), {
    status: code,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

const PROCESSING_FEE_RATE = 0.015;
const TROY_OZ_PER_GRAM = 1 / 31.1035;

const PRODUCT_LABELS: Record<string, string> = {
  gold_bars: "Gold Bars (Refined Bullion)",
  gold_nuggets: "Gold Nuggets (High-Purity Raw Form)",
  gold_dust: "Gold Dust (Alluvial Composition)",
  bulk_supply: "Bulk Gold Supply",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return fail("Method not allowed", 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return fail("Unauthorized", 401);

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) return fail("Unauthorized", 401);

    // Check KYC approval
    const { data: kyc } = await supabase
      .from("kyc_verifications")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!kyc || kyc.status !== "approved") {
      return fail("KYC verification required. Please complete identity verification before trading.", 403);
    }

    const body = await req.json();
    const { productType, orderType, weightGrams, spotPricePerOz } = body;

    if (!productType || !orderType || !weightGrams || !spotPricePerOz) {
      return fail("Missing required fields: productType, orderType, weightGrams, spotPricePerOz");
    }

    if (weightGrams <= 0) return fail("Weight must be positive");

    const weightOunces = weightGrams * TROY_OZ_PER_GRAM;
    const spotPricePerGram = spotPricePerOz * TROY_OZ_PER_GRAM;
    const subtotal = weightOunces * spotPricePerOz;
    const processingFee = subtotal * PROCESSING_FEE_RATE;
    const total = subtotal + processingFee;

    // For SELL orders: check wallet balance
    if (orderType === "sell") {
      const { data: wallet } = await supabase
        .from("wallets")
        .select("gold_grams")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!wallet || wallet.gold_grams < weightGrams) {
        return fail("Insufficient gold holdings in vault");
      }
    }

    // Create pending order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_type: orderType,
        product_type: productType,
        weight_grams: weightGrams,
        weight_ounces: weightOunces,
        spot_price_per_oz: spotPricePerOz,
        spot_price_per_gram: spotPricePerGram,
        subtotal_usd: subtotal,
        processing_fee_usd: processingFee,
        total_usd: total,
        status: "pending",
        reference_code: "",
      })
      .select()
      .single();

    if (orderErr || !order) return fail(`Failed to create order: ${orderErr?.message}`, 500);

    // For BUY orders: create Stripe checkout
    if (orderType === "buy") {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeKey) return fail("Payment system not configured. Please contact support.", 500);

      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
      const origin = req.headers.get("origin") || "https://finegoldafrica.com";
      const productLabel = PRODUCT_LABELS[productType] || productType;

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${productLabel} — ${weightGrams}g`,
                description: `Spot price: $${spotPricePerOz.toFixed(2)}/oz | Processing fee: 1.5%`,
              },
              unit_amount: Math.round(total * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/catalog`,
        metadata: { order_id: order.id, user_id: user.id },
      });

      await supabase
        .from("orders")
        .update({ stripe_session_id: session.id })
        .eq("id", order.id);

      return ok({ orderId: order.id, referenceCode: order.reference_code, checkoutUrl: session.url, sessionId: session.id, total, processingFee, subtotal });
    }

    // SELL orders: process immediately (deduct wallet gold, add cash)
    const { error: walletErr } = await supabase.rpc("process_sell_order", {
      p_user_id: user.id,
      p_order_id: order.id,
      p_weight_grams: weightGrams,
      p_weight_ounces: weightOunces,
      p_total_usd: total - processingFee, // proceeds after fee
    });

    if (walletErr) return fail(`Failed to process sell order: ${walletErr.message}`, 500);

    return ok({ orderId: order.id, referenceCode: order.reference_code, total, processingFee, subtotal, status: "completed" });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Order creation failed", 500);
  }
});
