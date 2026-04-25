import tiktoken
from typing import List, Dict


class TextChunker:
    """
    Split text into chunks for embedding.
    """
    
    def __init__(self, chunk_size=500, chunk_overlap=50):
        """
        Args:
            chunk_size: Target number of tokens per chunk
            chunk_overlap: Number of tokens to overlap between chunks
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.encoding = tiktoken.get_encoding("cl100k_base")  # GPT-4 encoding
    
    def count_tokens(self, text: str) -> int:
        """Count tokens in text."""
        return len(self.encoding.encode(text))
    
    def chunk_text(self, pages: List[Dict[str, any]]) -> List[Dict[str, any]]:
        """
        Split pages into chunks with metadata.
        
        Args:
            pages: List of dicts from PDFProcessor
        
        Returns:
            List of chunks: [{"text": "...", "page": 1, "chunk_id": 0}, ...]
        """
        chunks = []
        chunk_id = 0
        
        for page_data in pages:
            page_num = page_data['page']
            text = page_data['text']
            
            # Split by sentences (rough approximation)
            sentences = text.split('. ')
            
            current_chunk = []
            current_tokens = 0
            
            for sentence in sentences:
                sentence = sentence.strip()
                if not sentence:
                    continue
                
                # Add period back if not last sentence
                if not sentence.endswith('.'):
                    sentence += '.'
                
                sentence_tokens = self.count_tokens(sentence)
                
                # If adding this sentence exceeds chunk size, save current chunk
                if current_tokens + sentence_tokens > self.chunk_size and current_chunk:
                    chunk_text = ' '.join(current_chunk)
                    chunks.append({
                        'chunk_id': chunk_id,
                        'text': chunk_text,
                        'page': page_num,
                        'token_count': current_tokens
                    })
                    chunk_id += 1
                    
                    # Keep overlap: start new chunk with last few sentences
                    overlap_size = 0
                    overlap_sentences = []
                    for s in reversed(current_chunk):
                        s_tokens = self.count_tokens(s)
                        if overlap_size + s_tokens <= self.chunk_overlap:
                            overlap_sentences.insert(0, s)
                            overlap_size += s_tokens
                        else:
                            break
                    
                    current_chunk = overlap_sentences
                    current_tokens = overlap_size
                
                current_chunk.append(sentence)
                current_tokens += sentence_tokens
            
            # Add remaining chunk for this page
            if current_chunk:
                chunk_text = ' '.join(current_chunk)
                chunks.append({
                    'chunk_id': chunk_id,
                    'text': chunk_text,
                    'page': page_num,
                    'token_count': current_tokens
                })
                chunk_id += 1
        
        print(f"Created {len(chunks)} chunks from {len(pages)} pages")
        return chunks