import { requireEnv, sleep } from "./http.ts";

function evolutionHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: requireEnv("EVOLUTION_API_KEY"),
  };
}

export async function sendEvolutionReply(instance: string, phone: string, text: string) {
  const evolutionUrl = requireEnv("EVOLUTION_API_URL").replace(/\/+$/, "");
  const cleanPhone = phone.replace(/\D/g, "");
  if (!cleanPhone) throw new Error("Cannot send WhatsApp reply without a phone number");

  const body = { number: cleanPhone, text, options: { delay: 500 } };
  const endpointVariants = [
    `${evolutionUrl}/message/sendText/${instance}`,
    `${evolutionUrl}/message/sendText`,
  ];

  let lastError = "";
  for (const endpoint of endpointVariants) {
    const payload = endpoint.endsWith("/sendText") ? { ...body, instanceName: instance } : body;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: evolutionHeaders(),
        body: JSON.stringify(payload),
      });
      if (resp.ok) return;
      lastError = `Evolution send failed ${resp.status}: ${await resp.text()}`;
      await sleep(200 * attempt);
    }
  }

  throw new Error(lastError || "Evolution send failed");
}
