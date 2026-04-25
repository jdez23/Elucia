import logging

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import Conversation, Message
from .serializers import (
    ConversationSerializer,
    ConversationListSerializer,
    MessageSerializer,
)

logger = logging.getLogger(__name__)


class ConversationViewSet(viewsets.ModelViewSet):
    """
    GET    /api/conversations/           — list user's conversations
    POST   /api/conversations/           — create new conversation
    GET    /api/conversations/:id/       — conversation detail with messages
    DELETE /api/conversations/:id/       — delete conversation
    POST   /api/conversations/:id/messages/ — send a message
    """
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Conversation.objects.filter(user=self.request.user).select_related('manual')
        session_id = self.request.session.session_key
        return Conversation.objects.filter(session_id=session_id).select_related('manual')

    def get_serializer_class(self):
        if self.action == 'list':
            return ConversationListSerializer
        return ConversationSerializer

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            if not self.request.session.session_key:
                self.request.session.create()
            serializer.save(session_id=self.request.session.session_key)

    @action(detail=True, methods=['post'], throttle_scope='chat_messages')
    def messages(self, request, pk=None):
        """
        POST /api/conversations/:id/messages/
        Body: {"content": "How do I...?"}
        """
        conversation = self.get_object()
        content = request.data.get('content', '').strip()

        if not content:
            return Response(
                {'error': 'Content is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_message = Message.objects.create(
            conversation=conversation,
            role='user',
            content=content,
        )

        if conversation.manual_id:
            try:
                from apps.rag.query_pipeline import RAGQueryPipeline
                ai_content = RAGQueryPipeline().query(content, conversation.manual_id)
            except Exception:
                logger.exception(
                    "RAG pipeline error for conversation=%s manual=%s",
                    conversation.id, conversation.manual_id,
                )
                ai_content = (
                    "I encountered an error looking up the manual. Please try again."
                )
        else:
            ai_content = (
                "This conversation isn't linked to a manual. "
                "Please start a new conversation and select a manual."
            )

        ai_message = Message.objects.create(
            conversation=conversation,
            role='assistant',
            content=ai_content,
        )

        if not conversation.title and conversation.messages.count() == 2:
            conversation.title = content[:50]
            conversation.save(update_fields=['title'])

        return Response({
            'user_message': MessageSerializer(user_message).data,
            'ai_message': MessageSerializer(ai_message).data,
        })
