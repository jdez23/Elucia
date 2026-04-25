from .pdf_processor import PDFProcessor
from .text_chunker import TextChunker
from .pinecone_client import PineconeClient
from apps.manuals.models import Manual
from .openai_client import OpenAIClient
import time


class ManualIngestion:
    """
    Orchestrates the full PDF ingestion pipeline.
    """
    
    def __init__(self):
        self.pdf_processor = PDFProcessor()
        self.text_chunker = TextChunker(chunk_size=500, chunk_overlap=50)
        self.pinecone_client = PineconeClient()
    
    def ingest_manual(self, manual_id: int, pdf_path: str):
        """
        Full ingestion pipeline for a manual.
        
        Args:
            manual_id: Django Manual model ID
            pdf_path: Path to PDF file
        """
        print(f"\n{'='*60}")
        print(f"Starting ingestion for Manual ID: {manual_id}")
        print(f"{'='*60}\n")
        
        # Get manual from database
        try:
            manual = Manual.objects.get(id=manual_id)
            namespace = f"manual-{manual_id}"
        except Manual.DoesNotExist:
            print(f"Error: Manual with ID {manual_id} not found")
            return False
        
        # Step 1: Extract text from PDF
        print("Step 1: Extracting text from PDF...")
        pages = self.pdf_processor.extract_text(pdf_path)
        
        if not pages:
            print("Error: No text extracted from PDF")
            return False
        
        # Step 2: Chunk the text
        print("\nStep 2: Chunking text...")
        chunks = self.text_chunker.chunk_text(pages)
        
        # Step 3: Prepare vectors for Pinecone
        print("\nStep 3: Preparing data for Pinecone...")
        vectors = []
        
        for chunk in chunks:
            vector_id = f"manual-{manual_id}-chunk-{chunk['chunk_id']}"
            
            # Metadata to store with the vector
            metadata = {
                'text': chunk['text'],
                'page': chunk['page'],
                'manual_id': manual_id,
                'manual_name': f"{manual.manufacturer} {manual.name}",
                'chunk_id': chunk['chunk_id']
            }
            
            # For Pinecone with integrated embeddings, we send the text
            # Pinecone will embed it automatically using llama-text-embed-v2
            vectors.append({
                'id': vector_id,
                'values': chunk['text'],  # Pinecone will convert this to embedding
                'metadata': metadata
            })
        
        # Step 4: Upload to Pinecone (in batches)
        print(f"\nStep 4: Uploading {len(vectors)} chunks to Pinecone...")
        batch_size = 100
        
        for i in range(0, len(vectors), batch_size):
            batch = vectors[i:i + batch_size]
            print(f"  Uploading batch {i//batch_size + 1}/{(len(vectors)-1)//batch_size + 1}")
            
            success = self.pinecone_client.upsert_vectors(batch, namespace=namespace)
            
            if not success:
                print(f"Error uploading batch {i//batch_size + 1}")
                return False
            
            time.sleep(1)  # Rate limiting
        
        # Step 5: Update manual metadata
        print("\nStep 5: Updating manual metadata...")
        manual.pinecone_namespace = namespace
        manual.page_count = len(pages)
        manual.save()
        
        print(f"\n{'='*60}")
        print(f"✅ Ingestion complete!")
        print(f"  - Pages: {len(pages)}")
        print(f"  - Chunks: {len(chunks)}")
        print(f"  - Namespace: {namespace}")
        print(f"{'='*60}\n")
        
        return True