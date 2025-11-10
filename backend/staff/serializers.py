from rest_framework import serializers
from .models import Staff, OrderStaffAssignment


class StaffSerializer(serializers.ModelSerializer):
    join_date = serializers.DateField(format='%Y-%m-%d', input_formats=['%Y-%m-%d'], required=False)
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)

    class Meta:
        model = Staff
        fields = ['id', 'name', 'phone', 'address', 'role', 'join_date', 'created_at']
        read_only_fields = ['id', 'created_at']


class OrderStaffAssignmentSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.name', read_only=True)
    staff_role = serializers.CharField(source='staff.role', read_only=True)
    assigned_date = serializers.DateField(format='%Y-%m-%d')
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)

    class Meta:
        model = OrderStaffAssignment
        fields = [
            'id', 'order_id', 'staff_id', 'staff_name', 'staff_role',
            'assigned_date', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'order_id', 'staff_name', 'staff_role', 'created_at']


class OrderStaffAssignmentCreateSerializer(serializers.Serializer):
    staff_id = serializers.IntegerField()
    assigned_date = serializers.DateField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)

