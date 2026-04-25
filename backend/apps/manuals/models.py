from django.db import models


class Manual(models.Model):
    """
    Stores metadata about music gear manuals.
    """
    
    CATEGORY_CHOICES = [
        ('synth', 'Synthesizer'),
        ('drum_machine', 'Drum Machine'),
        ('sampler', 'Sampler'),
        ('groovebox', 'Groovebox'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=255)
    manufacturer = models.CharField(max_length=255)
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default='other'
    )
    description = models.TextField(blank=True)
    pdf_path = models.CharField(
        max_length=500,
        help_text="Path to PDF file (local or S3 URL)"
    )
    thumbnail_url = models.URLField(blank=True, null=True)
    is_premium = models.BooleanField(
        default=False,
        help_text="If True, only premium users can access"
    )
    page_count = models.IntegerField(null=True, blank=True)
    pinecone_namespace = models.CharField(
        max_length=255,
        blank=True,
        help_text="Namespace in Pinecone for this manual's vectors"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.manufacturer} {self.name}"
    
    class Meta:
        db_table = 'manuals'
        ordering = ['-created_at']
        verbose_name = 'Manual'
        verbose_name_plural = 'Manuals'