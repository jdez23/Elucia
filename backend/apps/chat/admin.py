from django.contrib import admin
from .models import Conversation, Message


class MessageInline(admin.TabularInline):
    """Shows messages inline within a conversation"""
    model = Message
    extra = 0
    readonly_fields = ['role', 'content', 'created_at']
    can_delete = False


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'manual', 'title', 'created_at', 'updated_at']
    list_filter = ['created_at', 'manual__category']
    search_fields = ['user__username', 'manual__name', 'title', 'session_id']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [MessageInline]
    
    def get_queryset(self, request):
        # Optimize queries
        return super().get_queryset(request).select_related('user', 'manual')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'role', 'content_preview', 'created_at']
    list_filter = ['role', 'created_at']
    search_fields = ['content', 'conversation__title']
    readonly_fields = ['created_at']
    
    def content_preview(self, obj):
        return obj.content[:100] + "..." if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Content'