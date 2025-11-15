#!/usr/bin/env python3
# Activate virtual environment: source venv/bin/activate
import os
import fitz  # PyMuPDF
import openai
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Environment setup
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

openai.api_key = OPENAI_API_KEY
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def process_pdf(file_path, manual_id):
    chunks = []
    doc = fitz.open(file_path)
    for page_num, page in enumerate(doc):
        text = page.get_text()
        if text.strip():
            chunks.append({
                "content": text.strip(),
                "page_number": page_num + 1
            })
    return chunks

def embed_and_upload(chunks, manual_id):
    for chunk in chunks:
        embedding_response = openai.Embedding.create(
            input=chunk["content"],
            model="text-embedding-ada-002"
        )
        embedding_vector = embedding_response["data"][0]["embedding"]

        supabase.table("manual_chunks").insert({
            "manual_id": manual_id,
            "content": chunk["content"],
            "page_number": chunk["page_number"],
            "embedding": embedding_vector
        }).execute()

# Example usage
manuals_to_process = [
    {"file": "manuals/digitakt_manual.pdf", "manual_id": "YOUR_DIGITAKT_MANUAL_UUID"}
]

for item in manuals_to_process:
    chunks = process_pdf(item["file"], item["manual_id"])
    embed_and_upload(chunks, item["manual_id"])
