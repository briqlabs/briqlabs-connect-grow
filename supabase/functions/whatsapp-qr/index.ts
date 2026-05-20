import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const EVOLUTION_BASE_URL = 'https://whatsapp-briqlabs.up.railway.app';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY');
    if (!EVOLUTION_API_KEY) throw new Error('EVOLUTION_API_KEY not configured');

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY')!;

    // Authenticate user
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action as 'connect' | 'status' | 'logout';
    const instanceName = `briq_${user.id.replace(/-/g, '').slice(0, 24)}`;

    const evoHeaders = {
      'apikey': EVOLUTION_API_KEY,
      'Content-Type': 'application/json',
    };

    const evoFetch = (path: string, init: RequestInit = {}) =>
      fetch(`${EVOLUTION_BASE_URL}${path}`, { ...init, headers: { ...evoHeaders, ...(init.headers || {}) } });

    if (action === 'status') {
      const res = await evoFetch(`/instance/connectionState/${instanceName}`);
      const data = await res.json().catch(() => ({}));
      const state = data?.instance?.state ?? data?.state ?? 'unknown';
      return new Response(JSON.stringify({ state, instanceName }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'logout') {
      await evoFetch(`/instance/logout/${instanceName}`, { method: 'DELETE' });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // action === 'connect' (default): ensure instance exists, then fetch QR
    // Try connect first — if instance doesn't exist, create it
    let qrRes = await evoFetch(`/instance/connect/${instanceName}`);
    if (qrRes.status === 404 || qrRes.status === 400) {
      const createRes = await evoFetch('/instance/create', {
        method: 'POST',
        body: JSON.stringify({
          instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
        }),
      });
      if (!createRes.ok) {
        const txt = await createRes.text();
        throw new Error(`Failed to create instance [${createRes.status}]: ${txt}`);
      }
      const createData = await createRes.json();
      // Create response often includes the qrcode directly
      const base64 = createData?.qrcode?.base64 ?? createData?.base64;
      if (base64) {
        return new Response(JSON.stringify({ qr: base64, instanceName, state: 'connecting' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      qrRes = await evoFetch(`/instance/connect/${instanceName}`);
    }

    if (!qrRes.ok) {
      const txt = await qrRes.text();
      throw new Error(`Failed to fetch QR [${qrRes.status}]: ${txt}`);
    }
    const qrData = await qrRes.json();
    const base64 = qrData?.base64 ?? qrData?.qrcode?.base64 ?? qrData?.qr ?? null;

    return new Response(JSON.stringify({ qr: base64, instanceName, state: 'connecting', raw: qrData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('whatsapp-qr error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});