import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireEnv } from "./http.ts";

export async function requireBusinessAccess(req: Request, businessId: string) {
  const authorization = req.headers.get("authorization") ?? "";
  const bearerToken = authorization.replace(/^Bearer\s+/i, "");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (serviceRoleKey && bearerToken && bearerToken === serviceRoleKey) return;

  const adminSecret = Deno.env.get("RAG_ADMIN_SECRET");
  const providedSecret = req.headers.get("x-rag-admin-secret");
  if (adminSecret && providedSecret && providedSecret === adminSecret) return;

  if (!authorization) throw new Error("Unauthorized: missing Authorization header");

  const userClient = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_ANON_KEY"), {
    global: { headers: { authorization } },
  });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data.user?.id) throw new Error("Unauthorized: invalid user session");
  if (data.user.id !== businessId) throw new Error("Forbidden: business_id does not match authenticated user");
}
