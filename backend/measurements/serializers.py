from rest_framework import serializers
from .models import MeasurementTemplate, Measurement


class MeasurementTemplateSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    
    class Meta:
        model = MeasurementTemplate
        fields = ['id', 'garment_type', 'gender', 'fields_json', 'display_name', 'created_at']
        read_only_fields = ['id', 'created_at']


class MeasurementSerializer(serializers.ModelSerializer):
    customer_id = serializers.IntegerField(source='customer.id', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    template_id = serializers.IntegerField(source='template.id', read_only=True)
    template_name = serializers.CharField(source='template.display_name', read_only=True)
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)

    class Meta:
        model = Measurement
        fields = [
            'id', 'customer', 'customer_id', 'customer_name', 'customer_phone',
            'garment_type', 'template', 'template_id', 'template_name',
            'measurements_json', 'created_at'
        ]
        read_only_fields = ['id', 'customer_id', 'customer_name', 'customer_phone', 'template_id', 'template_name', 'created_at']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set queryset dynamically to avoid circular import
        from customers.models import Customer
        from .models import MeasurementTemplate
        # Override customer and template fields to be writable
        self.fields['customer'] = serializers.PrimaryKeyRelatedField(
            queryset=Customer.objects.all(),
            write_only=False,
            required=True
        )
        self.fields['template'] = serializers.PrimaryKeyRelatedField(
            queryset=MeasurementTemplate.objects.all(),
            write_only=False,
            required=True
        )
    
    def to_representation(self, instance):
        """Ensure customer_id and template_id are always present in response"""
        ret = super().to_representation(instance)
        if 'customer_id' not in ret or ret['customer_id'] is None:
            ret['customer_id'] = instance.customer.id if instance.customer else None
        if 'template_id' not in ret or ret['template_id'] is None:
            ret['template_id'] = instance.template.id if instance.template else None
        return ret

