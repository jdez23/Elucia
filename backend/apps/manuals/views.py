from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Manual
from .serializers import ManualSerializer, ManualListSerializer


class ManualViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing manuals.
    GET /api/manuals/ - List all manuals
    GET /api/manuals/:id/ - Get single manual detail
    """
    queryset = Manual.objects.all()
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'manufacturer', 'is_premium']
    search_fields = ['name', 'manufacturer', 'description']
    ordering_fields = ['name', 'manufacturer', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ManualListSerializer
        return ManualSerializer