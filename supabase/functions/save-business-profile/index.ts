import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth context (validates JWT)
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return json({ error: "Unauthorized" }, 401);
    }
    const userId = userData.user.id;

    const contentType = req.headers.get("content-type") ?? "";
    let businessName = "";
    let businessType = "";
    let businessInfo = "";
    let file: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      businessName = String(form.get("business_name") ?? "").trim();
      businessType = String(form.get("business_type") ?? "").trim();
      businessInfo = String(form.get("business_info") ?? "").trim();
      const f = form.get("file");
      if (f instanceof File && f.size > 0) file = f;
    } else {
      const body = await req.json().catch(() => ({}));
      businessName = String(body.business_name ?? "").trim();
      businessType = String(body.business_type ?? "").trim();
      businessInfo = String(body.business_info ?? "").trim();
    }

    if (businessName.length < 2 || businessType.length < 2) {
      return json({ error: "business_name and business_type are required" }, 400);
    }
    if (!businessInfo && !file) {
      return json({ error: "Provide business_info or an uploaded file" }, 400);
    }

    // Service client for storage + DB write (RLS-safe because we scope by userId)
    const admin = createClient(supabaseUrl, serviceKey);

    let filePath: string | null = null;
    let fileName: string | null = null;

    if (file) {
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `${userId}/${Date.now()}_${safeName}`;
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { error: upErr } = await admin.storage
        .from("business-assets")
        .upload(path, bytes, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });
      if (upErr) return json({ error: `Upload failed: ${upErr.message}` }, 500);
      filePath = path;
      fileName = file.name;
    }

    const { data, error } = await admin
      .from("business_profiles")
      .upsert(
        {
          user_id: userId,
          business_name: businessName,
          business_type: businessType,
          business_info: businessInfo || null,
          ...(filePath ? { file_path: filePath, file_name: fileName } : {}),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();

    if (error) return json({ error: error.message }, 500);

    return json({ ok: true, profile: data });
  } catch (e) {
    return json({ error: (e as Error).message ?? "Unexpected error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}