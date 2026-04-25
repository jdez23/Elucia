from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, UsageLog


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile data.
    """
    
    class Meta:
        model = UserProfile
        fields = [
            'subscription_tier',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['subscription_tier', 'created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user data with nested profile.
    """
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'profile',
            'date_joined',
        ]
        read_only_fields = ['id', 'date_joined']
        extra_kwargs = {
            'password': {'write_only': True},
        }


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        # Create associated profile
        UserProfile.objects.create(user=user)
        return user


class UsageLogSerializer(serializers.ModelSerializer):
    """
    Serializer for usage logs.
    """
    
    class Meta:
        model = UsageLog
        fields = ['id', 'action_type', 'created_at']
        read_only_fields = ['id', 'created_at']