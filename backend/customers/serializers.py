from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    
    class Meta:
        model = Customer
        fields = ['id', 'name', 'phone', 'gender', 'address', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']

