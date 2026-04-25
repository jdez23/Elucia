import logging

from apps.manuals.models import Manual
from .openai_client import OpenAIClient
from .pinecone_client import PineconeClient

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert assistant helping musicians and producers understand their gear. \
You answer questions about music equipment based strictly on the provided manual excerpts.

Guidelines:
- Ground every answer in the provided context. If the answer isn't there, say so clearly.
- Be specific and technical when the question calls for it.
- Cite page numbers when available (e.g. "See page 14").
- Keep answers concise but complete — no filler, no padding."""


class RAGQueryPipeline:
    def __init__(self):
        self.openai_client = OpenAIClient()
        self.pinecone_client = PineconeClient()

    def query(self, question: str, manual_id: int, top_k: int = 6) -> str:
        try:
            manual = Manual.objects.get(id=manual_id)
        except Manual.DoesNotExist:
            logger.error("Manual %s not found for RAG query", manual_id)
            return "Sorry, I couldn't find that manual."

        namespace = manual.pinecone_namespace or f"manual-{manual_id}"

        query_embedding = self.openai_client.get_embedding(question)
        if not query_embedding:
            logger.error("Failed to generate embedding for query (manual_id=%s)", manual_id)
            return "Sorry, I encountered an error processing your question."

        matches = self.pinecone_client.query_vectors(
            query_vector=query_embedding,
            top_k=top_k,
            namespace=namespace,
        )

        if not matches:
            logger.warning("No Pinecone matches for manual_id=%s — namespace may be empty", manual_id)
            return (
                "I couldn't find relevant information in this manual. "
                "The manual may not have been ingested yet."
            )

        context_parts = []
        for match in matches:
            metadata = match.get('metadata', {})
            text = metadata.get('text', '').strip()
            page = metadata.get('page')
            if text:
                prefix = f"[Page {page}] " if page else ""
                context_parts.append(f"{prefix}{text}")

        if not context_parts:
            logger.warning("Matches found but no text metadata for manual_id=%s", manual_id)
            return "I found relevant sections but couldn't read their content."

        context = "\n\n---\n\n".join(context_parts)
        system_message = (
            f"{SYSTEM_PROMPT}\n\n"
            f"Manual: {manual.manufacturer} {manual.name}\n\n"
            f"Relevant excerpts:\n\n{context}"
        )

        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": question},
        ]

        response = self.openai_client.chat_completion(
            messages=messages,
            model="gpt-4o-mini",
            temperature=0.3,
        )

        if not response:
            logger.error("OpenAI chat completion failed for manual_id=%s", manual_id)
            return "Sorry, I encountered an error generating a response."

        return response
