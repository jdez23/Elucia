from pinecone import Pinecone, ServerlessSpec
import os
from dotenv import load_dotenv

load_dotenv()


class PineconeClient:
    """
    Wrapper for Pinecone vector database operations.
    """
    
    def __init__(self):
        self.api_key = os.getenv('PINECONE_API_KEY')
        self.environment = os.getenv('PINECONE_ENVIRONMENT')
        self.index_name = os.getenv('PINECONE_INDEX_NAME', 'elucia-manuals')
        
        # Initialize Pinecone
        self.pc = Pinecone(api_key=self.api_key)
        
        # Connect to index
        self.index = self.pc.Index(self.index_name)
    
    def upsert_vectors(self, vectors, namespace="default"):
        """
        Upload vectors to Pinecone.
        
        Args:
            vectors: List of dicts with 'id', 'values' (text or embedding), 'metadata'
            namespace: Namespace to organize vectors
        
        Example:
            vectors = [
                {
                    "id": "chunk-1",
                    "values": "text to embed" or [0.1, 0.2, ...],
                    "metadata": {"text": "...", "page": 1}
                }
            ]
        """
        try:
            # Format for Pinecone API
            formatted_vectors = []
            for v in vectors:
                formatted_vectors.append({
                    "id": v["id"],
                    "values": v["values"],
                    "metadata": v["metadata"]
                })
            
            self.index.upsert(
                vectors=formatted_vectors,
                namespace=namespace
            )
            return True
        except Exception as e:
            print(f"Error upserting vectors: {e}")
            return False
    
    def query_vectors(self, query_vector, top_k=5, namespace="default", filter=None):
        """
        Search for similar vectors.
        
        Args:
            query_vector: Embedding vector to search with
            top_k: Number of results to return
            namespace: Namespace to search in
            filter: Metadata filter (optional)
        
        Returns:
            List of matches with scores and metadata
        """
        try:
            results = self.index.query(
                vector=query_vector,
                top_k=top_k,
                namespace=namespace,
                include_metadata=True,
                filter=filter
            )
            return results['matches']
        except Exception as e:
            print(f"Error querying vectors: {e}")
            return []
    
    def delete_namespace(self, namespace):
        """
        Delete all vectors in a namespace.
        Useful for re-ingesting a manual.
        """
        try:
            self.index.delete(namespace=namespace, delete_all=True)
            return True
        except Exception as e:
            print(f"Error deleting namespace: {e}")
            return False
    
    def get_index_stats(self):
        """
        Get statistics about the index.
        """
        try:
            return self.index.describe_index_stats()
        except Exception as e:
            print(f"Error getting index stats: {e}")
            return None