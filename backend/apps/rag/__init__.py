def __init__(self):
    self.pdf_processor = PDFProcessor()
    self.text_chunker = TextChunker(chunk_size=500, chunk_overlap=50)
    self.pinecone_client = PineconeClient()
    self.openai_client = OpenAIClient()  # Add this line