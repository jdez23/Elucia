from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Conversation, Message
from .serializers import (
    ConversationSerializer,
    ConversationListSerializer,
    MessageSerializer
)


class ConversationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for conversations.
    GET /api/conversations/ - List user's conversations
    POST /api/conversations/ - Create new conversation
    GET /api/conversations/:id/ - Get conversation with all messages
    DELETE /api/conversations/:id/ - Delete conversation
    POST /api/conversations/:id/messages/ - Send a message (placeholder)
    """
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        # Return user's conversations or anonymous by session_id
        if self.request.user.is_authenticated:
            return Conversation.objects.filter(user=self.request.user).select_related('manual')
        else:
            session_id = self.request.session.session_key
            return Conversation.objects.filter(session_id=session_id).select_related('manual')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ConversationListSerializer
        return ConversationSerializer
    
    def perform_create(self, serializer):
        # Set user or session_id
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            if not self.request.session.session_key:
                self.request.session.create()
            serializer.save(session_id=self.request.session.session_key)
    
    @action(detail=True, methods=['post'])
    def messages(self, request, pk=None):
        """
        Send a message in a conversation.
        POST /api/conversations/:id/messages/
        Body: {"content": "How do I...?"}
        
        TODO: Integrate RAG pipeline here
        """
        conversation = self.get_object()
        content = request.data.get('content')
        
        if not content:
            return Response(
                {'error': 'Content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save user message
        user_message = Message.objects.create(
            conversation=conversation,
            role='user',
            content=content
        )
        
        # TODO: Call RAG pipeline here to generate response
        # For now, placeholder response
        ai_response = "This is a placeholder response. RAG pipeline will be integrated in Phase 7."
        
        # Save AI message
        ai_message = Message.objects.create(
            conversation=conversation,
            role='assistant',
            content=ai_response
        )
        
        # Update conversation title from first message
        if not conversation.title and conversation.messages.count() == 2:
            conversation.title = content[:50]
            conversation.save()
        
        return Response({
            'user_message': MessageSerializer(user_message).data,
            'ai_message': MessageSerializer(ai_message).data,
        })