from rest_framework import viewsets, status
from rest_framework.response import Response

from .models import Sample, SampleImage
from .serializers import SampleSerializer, SampleCreateSerializer


class SampleViewSet(viewsets.ModelViewSet):
    queryset = Sample.objects.prefetch_related('images').all()
    serializer_class = SampleSerializer

    def get_queryset(self):
        queryset = Sample.objects.prefetch_related('images').all()
        garment_type = self.request.query_params.get('garment_type', None)
        
        if garment_type:
            queryset = queryset.filter(garment_type=garment_type)
        
        return queryset.order_by('-id')

    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update':
            return SampleCreateSerializer
        return SampleSerializer

    def create(self, request, *args, **kwargs):
        serializer = SampleCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        sample = Sample.objects.create(
            garment_type=data['garment_type'],
            title=data['title'],
            description=data.get('description', '')
        )
        
        # Create sample images
        for idx, image_url in enumerate(data['images']):
            SampleImage.objects.create(
                sample=sample,
                image_url=image_url,
                display_order=idx
            )
        
        response_serializer = SampleSerializer(sample)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        serializer = SampleCreateSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        # Update sample fields
        if 'garment_type' in data:
            instance.garment_type = data['garment_type']
        if 'title' in data:
            instance.title = data['title']
        if 'description' in data:
            instance.description = data.get('description', '')
        instance.save()
        
        # Update images if provided
        if 'images' in data:
            # Delete existing images
            instance.images.all().delete()
            # Create new images
            for idx, image_url in enumerate(data['images']):
                SampleImage.objects.create(
                    sample=instance,
                    image_url=image_url,
                    display_order=idx
                )
        
        response_serializer = SampleSerializer(instance)
        return Response(response_serializer.data)
