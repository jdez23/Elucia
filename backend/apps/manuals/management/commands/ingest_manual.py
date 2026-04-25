from django.core.management.base import BaseCommand
from apps.rag.ingest import ManualIngestion
from apps.manuals.models import Manual


class Command(BaseCommand):
    help = 'Ingest a PDF manual into the vector database'
    
    def add_arguments(self, parser):
        parser.add_argument('manual_id', type=int, help='Manual ID from database')
        parser.add_argument('pdf_path', type=str, help='Path to PDF file')
    
    def handle(self, *args, **options):
        manual_id = options['manual_id']
        pdf_path = options['pdf_path']
        
        self.stdout.write(f"Ingesting manual {manual_id} from {pdf_path}")
        
        # Run ingestion
        ingestion = ManualIngestion()
        success = ingestion.ingest_manual(manual_id, pdf_path)
        
        if success:
            self.stdout.write(self.style.SUCCESS('✅ Ingestion successful!'))
        else:
            self.stdout.write(self.style.ERROR('❌ Ingestion failed!'))