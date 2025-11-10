from rest_framework import serializers
from .models import MeasurementTemplate, Measurement


class MeasurementTemplateSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    
    class Meta:
        model = MeasurementTemplate
        fields = ['id', 'garment_type', 'gender', 'fields_json', 'display_name', 'created_at']
        read_only_fields = ['id', 'created_at']


class MeasurementSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    template_name = serializers.CharField(source='template.display_name', read_only=True)
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)

    class Meta:
        model = Measurement
        fields = [
            'id', 'customer_id', 'customer_name', 'customer_phone',
            'garment_type', 'template_id', 'template_name',
            'measurements_json', 'created_at'
        ]
        read_only_fields = ['id', 'customer_name', 'customer_phone', 'template_name', 'created_at']

