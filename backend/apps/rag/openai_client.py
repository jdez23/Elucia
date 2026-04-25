from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()


class OpenAIClient:
    """
    Wrapper for OpenAI API operations.
    """
    
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        self.client = OpenAI(api_key=self.api_key)
    
    def get_embedding(self, text, model="text-embedding-3-small"):
        """
        Generate embedding for text.
        
        Args:
            text: Text to embed
            model: OpenAI embedding model
        
        Returns:
            List of floats (embedding vector)
        """
        try:
            response = self.client.embeddings.create(
                input=text,
                model=model
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return None
    
    def chat_completion(self, messages, model="gpt-4", temperature=0.7, stream=False):
        """
        Get chat completion from OpenAI.
        
        Args:
            messages: List of message dicts [{"role": "user", "content": "..."}]
            model: Model to use (gpt-4, gpt-3.5-turbo, etc.)
            temperature: Creativity (0.0-1.0)
            stream: Whether to stream response
        
        Returns:
            Response text (or stream object if stream=True)
        """
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                stream=stream
            )
            
            if stream:
                return response  # Return stream object
            else:
                return response.choices[0].message.content
        except Exception as e:
            print(f"Error in chat completion: {e}")
            return None
    
    def chat_completion_with_context(self, question, context_chunks, model="gpt-4", temperature=0.7):
        """
        Generate response with RAG context.
        
        Args:
            question: User's question
            context_chunks: List of relevant text chunks from vector search
            model: OpenAI model
            temperature: Creativity level
        
        Returns:
            AI response text
        """
        # Format context
        context = "\n\n".join([
            f"[Source {i+1}] {chunk}" 
            for i, chunk in enumerate(context_chunks)
        ])
        
        # Create system message with context
        system_message = f"""You are an expert assistant helping users understand music production equipment manuals. 
        
Use the following context from the manual to answer the user's question. If the answer is not in the context, say so clearly.

Context from manual:
{context}

Guidelines:
- Be specific and technical when needed
- Reference page numbers or sections when possible
- If unsure, acknowledge it
- Keep responses concise but complete"""
        
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": question}
        ]
        
        return self.chat_completion(messages, model=model, temperature=temperature)