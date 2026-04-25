from django.db import models
from django.contrib.auth.models import User


class Conversation(models.Model):
    """
    Represents a chat session between a user and the AI about a specific manual.
    """
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='conversations',
        null=True,
        blank=True,
        help_text="Null for anonymous free-tier users"
    )
    manual = models.ForeignKey(
        'manuals.Manual',
        on_delete=models.CASCADE,
        related_name='conversations'
    )
    title = models.CharField(
        max_length=255,
        blank=True,
        help_text="Auto-generated from first message"
    )
    session_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="For tracking anonymous users"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        user_display = self.user.username if self.user else f"Anonymous ({self.session_id[:8]})"
        return f"{user_display} - {self.manual.name}"
    
    class Meta:
        db_table = 'conversations'
        ordering = ['-updated_at']
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'


class Message(models.Model):
    """
    Individual messages within a conversation.
    """
    
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]
    
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        preview = self.content[:50] + "..." if len(self.content) > 50 else self.content
        return f"{self.role}: {preview}"
    
    class Meta:
        db_table = 'messages'
        ordering = ['created_at']
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'