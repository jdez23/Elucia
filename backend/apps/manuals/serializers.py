from rest_framework import serializers
from .models import Manual


class ManualSerializer(serializers.ModelSerializer):
    """
    Serializer for Manual model.
    Used for list and detail views.
    """
    
    class Meta:
        model = Manual
        fields = [
            'id',
            'name',
            'manufacturer',
            'category',
            'description',
            'thumbnail_url',
            'is_premium',
            'page_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ManualListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for manual listings.
    """
    
    class Meta:
        model = Manual
        fields = [
            'id',
            'name',
            'manufacturer',
            'category',
            'thumbnail_url',
            'is_premium',
        ]