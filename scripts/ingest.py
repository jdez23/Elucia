#!/usr/bin/env python3
"""
Elucia PDF Ingestion Pipeline
==============================
Extracts text from instrument manuals, chunks it, generates embeddings,
and uploads to Supabase pgvector for RAG retrieval.

Usage:
    source venv/bin/activate
    python ingest.py --slug moog-grandmother
    python ingest.py --slug akai-mpc-one
    python ingest.py --all

Prerequisites:
    Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and OPENAI_API_KEY in ../.env.local
    or create a .env file in the scripts/ directory.
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Iterator

import pdfplumber
import tiktoken
from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client

# Load env from project root .env.local, fallback to local .env
ROOT = Path(__file__).parent.parent
load_dotenv(ROOT / "frontend" / ".env.local")
load_dotenv(Path(__file__).parent / ".env")

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]

CHUNK_TARGET_TOKENS = 500
CHUNK_OVERLAP_TOKENS = 50
EMBEDDING_MODEL = "text-embedding-3-small"
EMBED_BATCH_SIZE = 100  # OpenAI allows up to 2048 inputs, but keep batches small
INSERT_BATCH_SIZE = 50


def get_encoder():
    return tiktoken.get_encoding("cl100k_base")


def count_tokens(text: str, encoder) -> int:
    return len(encoder.encode(text))


def extract_pages(pdf_path: Path) -> list[dict]:
    """Extract text from each page with page number metadata."""
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            text = text.strip()
            if text:
                pages.append({"page_number": i + 1, "text": text})
    print(f"  Extracted {len(pages)} non-empty pages from {pdf_path.name}")
    return pages


def detect_section_title(text: str) -> str | None:
    """Heuristically detect a section heading from the start of a text block."""
    lines = text.strip().split("\n")
    for line in lines[:3]:
        line = line.strip()
        if not line:
            continue
        # All caps line (common in manuals)
        if line.isupper() and 3 < len(line) < 80:
            return line.title()
        # Numbered section like "3.2 Filter Section"
        if len(line) < 80 and (line[0].isdigit() or line.startswith("Chapter")):
            return line
    return None


def chunk_pages(pages: list[dict], encoder) -> Iterator[dict]:
    """
    Sliding-window chunking over page text with token-based sizing.
    Each chunk carries section_title and page range metadata.
    """
    buffer_tokens = []
    buffer_text = []
    buffer_page_start = None
    buffer_page_end = None
    buffer_section = None
    chunk_index = 0

    def flush(is_overlap=False) -> dict | None:
        nonlocal chunk_index
        if not buffer_text:
            return None
        text = " ".join(buffer_text).strip()
        if count_tokens(text, encoder) < 30:
            return None
        chunk = {
            "chunk_index": chunk_index,
            "content": text,
            "section_title": buffer_section,
            "page_start": buffer_page_start,
            "page_end": buffer_page_end,
        }
        chunk_index += 1
        return chunk

    for page in pages:
        page_num = page["page_number"]
        paragraphs = [p.strip() for p in page["text"].split("\n\n") if p.strip()]

        for para in paragraphs:
            section = detect_section_title(para)
            if section:
                buffer_section = section

            para_tokens = encoder.encode(para)

            # If adding this paragraph would overflow, flush first
            if len(buffer_tokens) + len(para_tokens) > CHUNK_TARGET_TOKENS:
                chunk = flush()
                if chunk:
                    yield chunk

                # Keep overlap: last N tokens worth of text
                overlap_tokens = buffer_tokens[-CHUNK_OVERLAP_TOKENS:]
                overlap_text = encoder.decode(overlap_tokens) if overlap_tokens else ""
                buffer_tokens = list(overlap_tokens)
                buffer_text = [overlap_text] if overlap_text.strip() else []
                buffer_page_start = page_num

            buffer_tokens.extend(para_tokens)
            buffer_text.append(para)
            if buffer_page_start is None:
                buffer_page_start = page_num
            buffer_page_end = page_num

    # Flush remainder
    chunk = flush()
    if chunk:
        yield chunk


def embed_texts(texts: list[str], client: OpenAI) -> list[list[float]]:
    """Embed a batch of texts with retry on rate limit."""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.embeddings.create(
                model=EMBEDDING_MODEL,
                input=texts,
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            if attempt < max_retries - 1:
                wait = 2 ** attempt
                print(f"  Embedding error (attempt {attempt+1}): {e}. Retrying in {wait}s...")
                time.sleep(wait)
            else:
                raise


def ingest_instrument(slug: str, supabase, openai_client: OpenAI, encoder):
    print(f"\n{'='*50}")
    print(f"Ingesting: {slug}")
    print(f"{'='*50}")

    # Fetch instrument from DB
    result = supabase.table("instruments").select("id, name, manual_path").eq("slug", slug).single().execute()
    if not result.data:
        print(f"ERROR: Instrument '{slug}' not found in database.")
        return False

    instrument = result.data
    instrument_id = instrument["id"]
    manual_path = instrument["manual_path"]

    if not manual_path:
        print(f"ERROR: No manual_path set for '{slug}'.")
        return False

    pdf_path = ROOT / manual_path
    if not pdf_path.exists():
        print(f"ERROR: PDF not found at {pdf_path}")
        return False

    # Extract and chunk
    pages = extract_pages(pdf_path)
    chunks = list(chunk_pages(pages, encoder))
    print(f"  Generated {len(chunks)} chunks")

    # Embed in batches
    all_embeddings = []
    for i in range(0, len(chunks), EMBED_BATCH_SIZE):
        batch = chunks[i : i + EMBED_BATCH_SIZE]
        texts = [c["content"] for c in batch]
        embeddings = embed_texts(texts, openai_client)
        all_embeddings.extend(embeddings)
        print(f"  Embedded {min(i + EMBED_BATCH_SIZE, len(chunks))}/{len(chunks)} chunks")

    # Prepare rows
    rows = []
    for chunk, embedding in zip(chunks, all_embeddings):
        rows.append({
            "instrument_id": instrument_id,
            "content": chunk["content"],
            "embedding": embedding,
            "chunk_index": chunk["chunk_index"],
            "section_title": chunk["section_title"],
            "page_start": chunk["page_start"],
            "page_end": chunk["page_end"],
            "metadata": {},
        })

    # Delete existing chunks for this instrument (idempotent re-ingest)
    supabase.table("document_chunks").delete().eq("instrument_id", instrument_id).execute()
    print(f"  Cleared existing chunks for {slug}")

    # Insert in batches
    for i in range(0, len(rows), INSERT_BATCH_SIZE):
        batch = rows[i : i + INSERT_BATCH_SIZE]
        supabase.table("document_chunks").insert(batch).execute()
        print(f"  Inserted {min(i + INSERT_BATCH_SIZE, len(rows))}/{len(rows)} chunks")

    print(f"  Done: {len(rows)} chunks ingested for {instrument['name']}")
    return True


def main():
    parser = argparse.ArgumentParser(description="Ingest instrument manuals into Supabase")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--slug", help="Instrument slug to ingest (e.g. moog-grandmother)")
    group.add_argument("--all", action="store_true", help="Ingest all published instruments")
    args = parser.parse_args()

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
    encoder = get_encoder()

    if args.all:
        result = supabase.table("instruments").select("slug").eq("is_published", True).execute()
        slugs = [r["slug"] for r in result.data]
        print(f"Ingesting {len(slugs)} instruments: {', '.join(slugs)}")
    else:
        slugs = [args.slug]

    success_count = 0
    for slug in slugs:
        if ingest_instrument(slug, supabase, openai_client, encoder):
            success_count += 1

    print(f"\n{'='*50}")
    print(f"Complete: {success_count}/{len(slugs)} instruments ingested successfully.")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
