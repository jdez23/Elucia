from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """
    Extends Django's User model with subscription and payment info.
    One-to-one relationship with User.
    """
    
    SUBSCRIPTION_TIERS = [
        ('free', 'Free'),
        ('premium', 'Premium'),
    ]
    
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='profile'
    )
    subscription_tier = models.CharField(
        max_length=20,
        choices=SUBSCRIPTION_TIERS,
        default='free'
    )
    stripe_customer_id = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )
    stripe_subscription_id = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.subscription_tier}"
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'


class UsageLog(models.Model):
    """
    Tracks API usage for free tier rate limiting.
    """
    
    ACTION_TYPES = [
        ('question_asked', 'Question Asked'),
        ('manual_viewed', 'Manual Viewed'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='usage_logs',
        null=True,
        blank=True
    )
    session_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="For tracking anonymous users"
    )
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        user_display = self.user.username if self.user else f"Anonymous ({self.session_id[:8]})"
        return f"{user_display} - {self.action_type} - {self.created_at}"
    
    class Meta:
        db_table = 'usage_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['session_id', 'created_at']),
        ]