import logging
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1024  # matches the Pinecone index dimension


class OpenAIClient:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

    def get_embedding(self, text: str) -> list[float] | None:
        try:
            response = self.client.embeddings.create(
                input=text,
                model=EMBEDDING_MODEL,
                dimensions=EMBEDDING_DIMENSIONS,
            )
            return response.data[0].embedding
        except Exception:
            logger.exception("Error generating embedding")
            return None

    def chat_completion(self, messages: list, model: str = "gpt-4o-mini", temperature: float = 0.7, stream: bool = False):
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                stream=stream,
            )
            if stream:
                return response
            return response.choices[0].message.content
        except Exception:
            logger.exception("Error in chat completion")
            return None
