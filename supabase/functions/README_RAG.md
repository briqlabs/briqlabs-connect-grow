# Briqlabs WhatsApp RAG System

This implementation adds a production-ready RAG pipeline for WhatsApp automation:

- `ingest-knowledge`: stores source documents, chunks text, generates Gemini embeddings, and writes pgvector rows.
- `query-rag`: stores customer messages, retrieves business context with hybrid search, generates grounded NVIDIA NIM replies, logs evaluation, and can send WhatsApp replies.
- `whatsapp-webhook`: receives Evolution API webhooks and now routes actionable customer messages through the same RAG pipeline.

## Environment

Set Supabase Edge Function secrets:

```bash
supabase secrets set NVIDIA_API_KEY=...
supabase secrets set NVIDIA_CHAT_MODEL=nvidia/llama-3.3-nemotron-super-49b-v1.5
supabase secrets set NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
supabase secrets set GEMINI_API_KEY=...
supabase secrets set GEMINI_EXTRACTION_MODEL=gemini-1.5-flash
supabase secrets set GEMINI_EMBEDDING_MODEL=gemini-embedding-001
supabase secrets set EVOLUTION_API_URL=https://your-evolution-api.example.com
supabase secrets set EVOLUTION_API_KEY=...
supabase secrets set RAG_MATCH_THRESHOLD=0.62
supabase secrets set RAG_MIN_RETRIEVAL_SCORE=0.58
supabase secrets set RAG_MIN_FAITHFULNESS_SCORE=0.65
supabase secrets set RAG_ADMIN_SECRET=optional-server-to-server-secret
```

Supabase injects `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` into Edge Functions in hosted projects. For local serving, copy `.env.example` to `supabase/functions/.env` and fill it.

`NVIDIA_CHAT_MODEL` can be changed to any chat model available through NVIDIA NIM's OpenAI-compatible `/v1/chat/completions` endpoint. `NVIDIA_BASE_URL` defaults to `https://integrate.api.nvidia.com/v1` and only needs to be set if you use a custom/self-hosted NIM endpoint.

## Deploy

```bash
supabase link --project-ref ssibljhoivomlrtqathi
supabase db push --linked --yes
supabase functions deploy ingest-knowledge --project-ref ssibljhoivomlrtqathi
supabase functions deploy query-rag --project-ref ssibljhoivomlrtqathi
supabase functions deploy whatsapp-webhook --no-verify-jwt --project-ref ssibljhoivomlrtqathi
```

Deploy `ingest-knowledge` and `query-rag` with JWT verification enabled. They also validate that `business_id` matches the authenticated user, or accept `x-rag-admin-secret` when `RAG_ADMIN_SECRET` is configured.

## Ingest Knowledge

Authenticated request:

```bash
curl -s -X POST "$SUPABASE_URL/functions/v1/ingest-knowledge" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_ACCESS_TOKEN" \
  --data '{
    "business_id": "11111111-1111-1111-1111-111111111111",
    "replace_existing": false,
    "ingest_existing_business_data": true,
    "documents": [
      {
        "title": "Business profile",
        "source_type": "business_profile",
        "content": "Briqlabs offers WhatsApp AI automation for lead capture, FAQs, and appointment booking. Support hours are 10 AM to 7 PM IST."
      },
      {
        "title": "Pricing FAQ",
        "source_type": "faq",
        "question": "What is the starter plan price?",
        "answer": "The starter plan is INR 4,999 per month."
      }
    ]
  }'
```

Server-to-server request:

```bash
curl -s -X POST "$SUPABASE_URL/functions/v1/ingest-knowledge" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "x-rag-admin-secret: $RAG_ADMIN_SECRET" \
  --data @knowledge.json
```

## Query RAG

```bash
curl -s -X POST "$SUPABASE_URL/functions/v1/query-rag" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_ACCESS_TOKEN" \
  --data '{
    "business_id": "11111111-1111-1111-1111-111111111111",
    "customer_phone": "919999999999",
    "message": "What are your support hours?",
    "send_whatsapp": false
  }'
```

To send a WhatsApp reply from `query-rag`, pass:

```json
{
  "send_whatsapp": true,
  "whatsapp_instance": "user_11111111_1111_1111_1111_111111111111"
}
```

## Index Uploaded Business Files

The frontend now calls `ingest-knowledge` after uploading files. To re-index existing uploads manually:

```bash
curl -s -X POST "$SUPABASE_URL/functions/v1/ingest-knowledge" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_ACCESS_TOKEN" \
  --data '{
    "business_id": "11111111-1111-1111-1111-111111111111",
    "ingest_existing_files": true
  }'
```

To index specific `business_files` rows:

```json
{
  "business_id": "11111111-1111-1111-1111-111111111111",
  "file_ids": ["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"]
}
```

Text-like files are decoded directly. PDFs, images, and Office-style documents are sent to Gemini for plain-text extraction before chunking and embedding.

## Evolution Webhook Payload

Configure Evolution API to send incoming message events to:

```text
https://ssibljhoivomlrtqathi.supabase.co/functions/v1/whatsapp-webhook
```

Example payload:

```json
{
  "event": "MESSAGES_UPSERT",
  "instance": "user_11111111_1111_1111_1111_111111111111",
  "data": {
    "key": {
      "remoteJid": "919999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "message-id-1"
    },
    "message": {
      "conversation": "What is your starter plan price?"
    },
    "pushName": "Customer",
    "messageTimestamp": 1779942400
  }
}
```

## Local Testing

```bash
supabase start
supabase db reset
supabase functions serve ingest-knowledge --env-file supabase/functions/.env
supabase functions serve query-rag --env-file supabase/functions/.env
supabase functions serve whatsapp-webhook --env-file supabase/functions/.env
```

Call local functions at:

```text
http://127.0.0.1:54321/functions/v1/ingest-knowledge
http://127.0.0.1:54321/functions/v1/query-rag
http://127.0.0.1:54321/functions/v1/whatsapp-webhook
```

## Safety Behavior

The assistant only answers from retrieved business context. If no chunks pass the similarity/retrieval thresholds, or the LLM-as-judge faithfulness score is too low, it returns:

```text
I could not find that information. Please contact the business directly.
```

Every response writes an `ai_eval_logs` row with retrieved chunks, generated answer, retrieval score, faithfulness score, and latency.
