import { createClient } from "jsr:@supabase/supabase-js@2";

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

// Auto-approve KYC for demo purposes (in production this would be manual review)
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return fail("Unauthorized", 401);

    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authErr || !user) return fail("Unauthorized", 401);

    const body = await req.json();
    const { action, documentType, documentPath, licensePath } = body;

    if (action === "submit") {
      const { data: existing } = await supabase
        .from("kyc_verifications")
        .select("id, status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing && existing.status === "approved") {
        return ok({ status: "approved", message: "KYC already approved" });
      }

      const upsertData = {
        user_id: user.id,
        document_type: documentType || "government_id",
        document_path: documentPath || null,
        license_path: licensePath || null,
        status: "pending" as const,
        submitted_at: new Date().toISOString(),
      };

      if (existing) {
        await supabase.from("kyc_verifications").update(upsertData).eq("user_id", user.id);
      } else {
        await supabase.from("kyc_verifications").insert(upsertData);
      }

      return ok({ status: "pending", message: "KYC submitted for review. Approval typically takes 24-48 hours." });
    }

    if (action === "approve_demo") {
      // Demo auto-approve for testing
      const { data: kyc } = await supabase
        .from("kyc_verifications")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!kyc) {
        await supabase.from("kyc_verifications").insert({
          user_id: user.id,
          document_type: "government_id",
          status: "approved",
          reviewed_at: new Date().toISOString(),
        });
      } else {
        await supabase.from("kyc_verifications").update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
        }).eq("user_id", user.id);
      }

      return ok({ status: "approved", message: "KYC approved (demo mode)" });
    }

    return fail("Unknown action");
  } catch (err) {
    return fail(err instanceof Error ? err.message : "KYC operation failed", 500);
  }
});
