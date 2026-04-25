import logging
import time

from .pdf_processor import PDFProcessor
from .text_chunker import TextChunker
from .pinecone_client import PineconeClient
from .openai_client import OpenAIClient
from apps.manuals.models import Manual

logger = logging.getLogger(__name__)


class ManualIngestion:
    def __init__(self):
        self.pdf_processor = PDFProcessor()
        self.text_chunker = TextChunker(chunk_size=500, chunk_overlap=50)
        self.pinecone_client = PineconeClient()
        self.openai_client = OpenAIClient()

    def ingest_manual(self, manual_id: int, pdf_path: str) -> bool:
        logger.info("Starting ingestion for Manual ID: %s from %s", manual_id, pdf_path)

        try:
            manual = Manual.objects.get(id=manual_id)
        except Manual.DoesNotExist:
            logger.error("Manual with ID %s not found", manual_id)
            return False

        namespace = f"manual-{manual_id}"

        pages = self.pdf_processor.extract_text(pdf_path)
        if not pages:
            logger.error("No text extracted from PDF: %s", pdf_path)
            return False

        logger.info("Extracted %d pages; chunking...", len(pages))
        chunks = self.text_chunker.chunk_text(pages)
        logger.info("Produced %d chunks; generating embeddings...", len(chunks))

        vectors = []
        for chunk in chunks:
            embedding = self.openai_client.get_embedding(chunk['text'])
            if not embedding:
                logger.warning("Could not embed chunk %s — skipping", chunk['chunk_id'])
                continue

            vectors.append({
                'id': f"manual-{manual_id}-chunk-{chunk['chunk_id']}",
                'values': embedding,
                'metadata': {
                    'text': chunk['text'],
                    'page': chunk['page'],
                    'manual_id': manual_id,
                    'manual_name': f"{manual.manufacturer} {manual.name}",
                    'chunk_id': chunk['chunk_id'],
                },
            })

        logger.info("Uploading %d vectors to Pinecone namespace '%s'...", len(vectors), namespace)
        batch_size = 100
        total_batches = (len(vectors) - 1) // batch_size + 1

        for i in range(0, len(vectors), batch_size):
            batch = vectors[i:i + batch_size]
            batch_num = i // batch_size + 1
            logger.debug("Uploading batch %d/%d", batch_num, total_batches)

            if not self.pinecone_client.upsert_vectors(batch, namespace=namespace):
                logger.error("Failed to upload batch %d/%d", batch_num, total_batches)
                return False

            time.sleep(1)

        manual.pinecone_namespace = namespace
        manual.page_count = len(pages)
        manual.save(update_fields=['pinecone_namespace', 'page_count'])

        logger.info(
            "Ingestion complete — manual_id=%s pages=%d chunks=%d vectors=%d namespace=%s",
            manual_id, len(pages), len(chunks), len(vectors), namespace,
        )
        return True
