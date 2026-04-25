from django.contrib import admin
from .models import Manual


@admin.register(Manual)
class ManualAdmin(admin.ModelAdmin):
    list_display = ['name', 'manufacturer', 'category', 'is_premium', 'created_at']
    list_filter = ['category', 'is_premium', 'manufacturer']
    search_fields = ['name', 'manufacturer', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'manufacturer', 'category', 'description')
        }),
        ('File & Media', {
            'fields': ('pdf_path', 'thumbnail_url', 'page_count')
        }),
        ('Access Control', {
            'fields': ('is_premium',)
        }),
        ('Technical', {
            'fields': ('pinecone_namespace', 'created_at', 'updated_at')
        }),
    )