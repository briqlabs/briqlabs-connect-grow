import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireBusinessAccess } from "../shared/auth.ts";
import { chunkText, normalizeDocumentText, type DocumentInput } from "../shared/chunking.ts";
import { embedTexts } from "../shared/embeddings.ts";
import { extractBusinessFileText, type BusinessFileRow } from "../shared/file-extraction.ts";
import { corsHeaders, jsonResponse, requireEnv } from "../shared/http.ts";

type IngestRequest = {
  business_id: string;
  documents?: DocumentInput[];
  replace_existing?: boolean;
  ingest_existing_business_data?: boolean;
  ingest_existing_files?: boolean;
  file_ids?: string[];
  delete_file_paths?: string[];
  delete_source_urls?: string[];
};

function getSourceType(doc: DocumentInput) {
  return doc.source_type ?? (doc.question || doc.answer ? "faq" : "plain_text");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => null) as IngestRequest | null;
    if (!body?.business_id) return jsonResponse({ error: "business_id is required" }, 400);

    //await requireBusinessAccess(req, body.business_id);
    const authHeader = req.headers.get("Authorization");

      if (!authHeader) {
        return jsonResponse({ error: "Missing authorization" }, 401);
      }

    const db = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"));
    let documents = body.documents ?? [];

    if (body.delete_source_urls?.length) {
      const { error } = await db
        .from("knowledge_documents")
        .delete()
        .eq("business_id", body.business_id)
        .in("source_url", body.delete_source_urls);
      if (error) throw new Error(`Failed to delete indexed knowledge: ${error.message}`);
      if (
        !body.delete_file_paths?.length &&
        !body.ingest_existing_business_data &&
        !body.ingest_existing_files &&
        !body.file_ids?.length &&
        documents.length === 0
      ) {
        return jsonResponse({ ok: true, deleted_indexed_documents: body.delete_source_urls.length, ingested: [] });
      }
    }

    if (body.delete_file_paths?.length) {
      const sourceUrls = body.delete_file_paths.map((filePath) => `storage://business-assets/${filePath}`);
      const { error } = await db
        .from("knowledge_documents")
        .delete()
        .eq("business_id", body.business_id)
        .in("source_url", sourceUrls);
      if (error) throw new Error(`Failed to delete indexed file knowledge: ${error.message}`);
      if (!body.ingest_existing_business_data && !body.ingest_existing_files && !body.file_ids?.length && documents.length === 0) {
        return jsonResponse({ ok: true, deleted_indexed_files: sourceUrls.length, ingested: [] });
      }
    }

    if (body.ingest_existing_business_data) {
      const { data, error } = await db
        .from("business_information")
        .select("id,name,description,created_at")
        .eq("user_id", body.business_id)
        .order("created_at", { ascending: true });
      if (error) throw new Error(`Failed to load existing business data: ${error.message}`);
      documents = [
        ...documents,
        ...((data ?? []).map((row) => ({
          title: row.name,
          content: row.description,
          source_type: "business_profile",
          source_url: `business-information://${row.id}`,
          metadata: { source_table: "business_information", business_information_id: row.id, created_at: row.created_at },
        })) as DocumentInput[]),
      ];
    }

    if (body.ingest_existing_files || (body.file_ids?.length ?? 0) > 0) {
      let query = db
        .from("business_files")
        .select("id,file_name,file_path,mime_type,file_size,created_at")
        .eq("user_id", body.business_id)
        .order("created_at", { ascending: true });

      if (body.file_ids?.length) {
        query = query.in("id", body.file_ids);
      }

      const { data, error } = await query;
      if (error) throw new Error(`Failed to load business files: ${error.message}`);

      for (const fileRow of (data ?? []) as BusinessFileRow[]) {
        try {
          documents.push(await extractBusinessFileText(db, fileRow));
        } catch (error) {
          console.error("Failed to extract uploaded file", {
            business_id: body.business_id,
            file_id: fileRow.id,
            file_name: fileRow.file_name,
            error: (error as Error).message,
          });
        }
      }
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      return jsonResponse({ error: "documents must be provided or existing data/files must produce extractable text" }, 400);
    }

    if (body.replace_existing) {
      const { error } = await db.from("knowledge_documents").delete().eq("business_id", body.business_id);
      if (error) throw new Error(`Failed to replace existing knowledge: ${error.message}`);
    }

    const summary = [];
    for (const doc of documents) {
      const rawContent = normalizeDocumentText(doc);
      if (!rawContent) {
        console.warn("Skipping empty document", { title: doc.title });
        continue;
      }

      if (doc.source_url) {
        const { error } = await db
          .from("knowledge_documents")
          .delete()
          .eq("business_id", body.business_id)
          .eq("source_url", doc.source_url);
        if (error) throw new Error(`Failed to refresh existing document: ${error.message}`);
      }

      const { data: documentRow, error: documentError } = await db
        .from("knowledge_documents")
        .insert({
          business_id: body.business_id,
          title: doc.title?.trim() || "Untitled document",
          source_type: getSourceType(doc),
          source_url: doc.source_url ?? null,
          raw_content: rawContent,
        })
        .select("id")
        .single();

      if (documentError || !documentRow?.id) {
        throw new Error(`Failed to store document: ${documentError?.message ?? "missing id"}`);
      }

      const chunks = chunkText(rawContent, {
        ...(doc.metadata ?? {}),
        title: doc.title,
        source_type: getSourceType(doc),
        source_url: doc.source_url ?? null,
      });

      const embeddings = await embedTexts(chunks.map((chunk) => chunk.text), "RETRIEVAL_DOCUMENT");
      console.log("Embedding dimension", embeddings[0]?.length);
      const rows = chunks.map((chunk, index) => ({
        business_id: body.business_id,
        document_id: documentRow.id,
        chunk_text: chunk.text,
        embedding: embeddings[index],
        metadata: chunk.metadata,
      }));

      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { error } = await db.from("knowledge_chunks").insert(batch);
        //if (error) throw new Error(`Failed to store chunks: ${error.message}`);
        if (error) {
          console.error("Chunk insert failed", {
            error,
            sampleEmbedding: rows[0]?.embedding,
            embeddingLength: embeddings[0]?.length,
          });

          throw new Error(
            `Failed to store chunks: ${error.message}`
          );
        }
      }

      summary.push({ document_id: documentRow.id, title: doc.title, chunks: chunks.length });
      console.info("Ingested knowledge document", { business_id: body.business_id, document_id: documentRow.id, chunks: chunks.length });
    }

    return jsonResponse({ ok: true, ingested: summary });
  } catch (error) {
    console.error("ingest-knowledge failed", { error: (error as Error).message });
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});
