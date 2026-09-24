import { getContent } from "@/lib/content";

// API de Conversões da Meta. Crie o token no Gerenciador de Eventos e salve
// na Vercel como variável de ambiente META_CAPI_TOKEN. Sem o token, não faz nada.
export async function POST(req) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) return new Response(null, { status: 204 });
  try {
    const { event_name, event_id, event_source_url, fbp, fbc } = await req.json();
    if (!["PageView", "Contact"].includes(event_name)) return new Response(null, { status: 400 });
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
    const payload = {
      data: [{
        event_name, event_id, event_source_url,
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        user_data: {
          client_ip_address: ip || undefined,
          client_user_agent: req.headers.get("user-agent") || undefined,
          fbp: fbp || undefined, fbc: fbc || undefined,
        },
      }],
      ...(process.env.META_TEST_CODE ? { test_event_code: process.env.META_TEST_CODE } : {}),
    };
    await fetch(`https://graph.facebook.com/v21.0/${(await getContent()).rastreio.metaPixel}/events?access_token=${token}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
  } catch {}
  return new Response(null, { status: 204 });
}
