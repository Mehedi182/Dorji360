from django.db.models import Sum
from rest_framework import serializers
from .models import Order, OrderItem
from staff.models import OrderStaffAssignment


class OrderItemSerializer(serializers.ModelSerializer):
    price = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'order_id', 'garment_type', 'quantity', 'price', 'fabric_details']
        read_only_fields = ['id', 'order_id']
    
    def get_price(self, obj):
        return float(obj.price)


class OrderItemCreateSerializer(serializers.Serializer):
    garment_type = serializers.CharField()
    quantity = serializers.IntegerField(min_value=1)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    fabric_details = serializers.CharField(required=False, allow_blank=True)


class OrderSerializer(serializers.ModelSerializer):
    order_date = serializers.DateField(format='%Y-%m-%d', input_formats=['%Y-%m-%d'], required=False)
    delivery_date = serializers.DateField(format='%Y-%m-%d', input_formats=['%Y-%m-%d'], required=False)
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer_id', 'order_date', 'delivery_date',
            'status', 'total_amount', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class OrderWithDetailsSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    paid_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    assigned_staff = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    order_date = serializers.DateField(format='%Y-%m-%d')
    delivery_date = serializers.DateField(format='%Y-%m-%d')
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer_id', 'customer_name', 'customer_phone',
            'order_date', 'delivery_date', 'status', 'total_amount',
            'notes', 'created_at', 'items', 'paid_amount',
            'remaining_amount', 'assigned_staff'
        ]
        read_only_fields = ['id', 'created_at']

    def get_total_amount(self, obj):
        return float(obj.total_amount)

    def get_paid_amount(self, obj):
        return float(obj.payments.aggregate(total=Sum('amount'))['total'] or 0)

    def get_remaining_amount(self, obj):
        paid = self.get_paid_amount(obj)
        return float(obj.total_amount) - paid

    def get_assigned_staff(self, obj):
        assignments = obj.staff_assignments.all()
        return [
            {
                'id': a.id,
                'staff_id': a.staff_id,
                'staff_name': a.staff.name,
                'staff_role': a.staff.role,
                'assigned_date': a.assigned_date.isoformat(),
                'notes': a.notes,
            }
            for a in assignments
        ]


class OrderCreateSerializer(serializers.Serializer):
    customer_id = serializers.IntegerField()
    order_date = serializers.DateField(required=False)
    delivery_date = serializers.DateField()
    items = OrderItemCreateSerializer(many=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    assigned_staff_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True
    )

