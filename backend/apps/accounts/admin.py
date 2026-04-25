from django.contrib import admin
from .models import UserProfile, UsageLog


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'subscription_tier', 'created_at']
    list_filter = ['subscription_tier', 'created_at']
    search_fields = ['user__username', 'user__email', 'stripe_customer_id']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UsageLog)
class UsageLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'session_id', 'action_type', 'created_at']
    list_filter = ['action_type', 'created_at']
    search_fields = ['user__username', 'session_id']
    readonly_fields = ['created_at']