import PyPDF2
import pdfplumber
from typing import List, Dict


class PDFProcessor:
    """
    Extract and process text from PDF files.
    """
    
    def extract_text_pypdf2(self, pdf_path: str) -> List[Dict[str, any]]:
        """
        Extract text from PDF using PyPDF2.
        
        Returns:
            List of dicts: [{"page": 1, "text": "..."}, ...]
        """
        pages = []
        
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    text = page.extract_text()
                    
                    if text.strip():  # Only add non-empty pages
                        pages.append({
                            'page': page_num + 1,
                            'text': text
                        })
        except Exception as e:
            print(f"Error extracting with PyPDF2: {e}")
        
        return pages
    
    def extract_text_pdfplumber(self, pdf_path: str) -> List[Dict[str, any]]:
        """
        Extract text from PDF using pdfplumber (backup method).
        """
        pages = []
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    text = page.extract_text()
                    
                    if text and text.strip():
                        pages.append({
                            'page': page_num + 1,
                            'text': text
                        })
        except Exception as e:
            print(f"Error extracting with pdfplumber: {e}")
        
        return pages
    
    def extract_text(self, pdf_path: str) -> List[Dict[str, any]]:
        """
        Extract text from PDF. Tries PyPDF2 first, falls back to pdfplumber.
        """
        print(f"Extracting text from: {pdf_path}")
        
        # Try PyPDF2 first
        pages = self.extract_text_pypdf2(pdf_path)
        
        # If no text extracted, try pdfplumber
        if not pages:
            print("PyPDF2 failed, trying pdfplumber...")
            pages = self.extract_text_pdfplumber(pdf_path)
        
        print(f"Extracted {len(pages)} pages")
        return pages
    
    def clean_text(self, text: str) -> str:
        """
        Clean extracted text (remove extra whitespace, fix encoding issues).
        """
        # Remove multiple spaces
        text = ' '.join(text.split())
        
        # Remove common PDF artifacts
        text = text.replace('\x00', '')
        text = text.replace('\uf0b7', '•')  # Fix bullet points
        
        return text.strip()