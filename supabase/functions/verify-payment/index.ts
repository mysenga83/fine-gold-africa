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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { sessionId } = await req.json();
    if (!sessionId) return fail("Missing sessionId");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return fail("Payment system not configured", 500);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return ok({ verified: false, status: session.payment_status });
    }

    // Fetch the order
    const { data: order } = await supabase
      .from("orders")
      .select("id, status, user_id, weight_grams, weight_ounces")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (!order) return fail("Order not found", 404);
    if (order.status === "completed") {
      return ok({ verified: true, status: "completed", alreadyProcessed: true });
    }

    // Update order to completed + update wallet gold holdings
    const { error: rpcErr } = await supabase.rpc("process_buy_order", {
      p_user_id: order.user_id,
      p_order_id: order.id,
      p_weight_grams: order.weight_grams,
      p_weight_ounces: order.weight_ounces,
      p_customer_email: session.customer_details?.email ?? "",
      p_customer_name: session.customer_details?.name ?? "",
      p_payment_intent: (session.payment_intent as string) ?? "",
    });

    if (rpcErr) return fail(`Failed to complete order: ${rpcErr.message}`, 500);

    return ok({ verified: true, status: "completed", orderId: order.id, customerEmail: session.customer_details?.email });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Verification failed", 500);
  }
});
