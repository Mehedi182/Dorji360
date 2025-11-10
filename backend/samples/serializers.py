from rest_framework import serializers
from .models import Sample, SampleImage


class SampleImageSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)

    class Meta:
        model = SampleImage
        fields = ['id', 'sample_id', 'image_url', 'display_order', 'created_at']
        read_only_fields = ['id', 'sample_id', 'created_at']


class SampleSerializer(serializers.ModelSerializer):
    images = SampleImageSerializer(many=True, read_only=True)
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)

    class Meta:
        model = Sample
        fields = ['id', 'garment_type', 'title', 'description', 'images', 'created_at']
        read_only_fields = ['id', 'created_at']


class SampleCreateSerializer(serializers.Serializer):
    garment_type = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)
    images = serializers.ListField(
        child=serializers.CharField(),
        min_length=1
    )

