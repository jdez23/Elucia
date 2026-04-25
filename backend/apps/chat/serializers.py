from rest_framework import serializers
from .models import Conversation, Message
from apps.manuals.serializers import ManualListSerializer


class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for individual messages.
    """
    
    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    """
    Serializer for conversations with nested messages.
    """
    messages = MessageSerializer(many=True, read_only=True)
    manual = ManualListSerializer(read_only=True)
    manual_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Conversation
        fields = [
            'id',
            'user',
            'manual',
            'manual_id',
            'title',
            'session_id',
            'messages',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Auto-set user from request context
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)


class ConversationListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for conversation listings (without all messages).
    """
    manual = ManualListSerializer(read_only=True)
    message_count = serializers.SerializerMethodField()
    last_message_preview = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id',
            'manual',
            'title',
            'message_count',
            'last_message_preview',
            'created_at',
            'updated_at',
        ]
    
    def get_message_count(self, obj):
        return obj.messages.count()
    
    def get_last_message_preview(self, obj):
        last_message = obj.messages.last()
        if last_message:
            preview = last_message.content[:100]
            return preview + "..." if len(last_message.content) > 100 else preview
        return None