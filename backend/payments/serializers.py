from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    order = serializers.PrimaryKeyRelatedField(queryset=Payment.objects.none(), write_only=True)
    date = serializers.DateField(format='%Y-%m-%d', input_formats=['%Y-%m-%d'], required=False)
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'order_id', 'amount', 'payment_type',
            'payment_method', 'date', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'order_id']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set queryset for order field dynamically
        if 'order' in self.fields:
            from orders.models import Order
            self.fields['order'].queryset = Order.objects.all()
    
    def to_representation(self, instance):
        """Convert Decimal amount to float in response"""
        ret = super().to_representation(instance)
        if 'amount' in ret:
            ret['amount'] = float(instance.amount)
        # Ensure order_id is present
        ret['order_id'] = instance.order.id
        return ret


class DeliverySerializer(serializers.Serializer):
    """Delivery is Order with computed fields - not a separate model"""
    id = serializers.IntegerField()
    customer_id = serializers.IntegerField()
    customer_name = serializers.CharField()
    customer_phone = serializers.CharField()
    order_date = serializers.DateField()
    delivery_date = serializers.DateField()
    status = serializers.CharField()
    total_amount = serializers.FloatField()
    notes = serializers.CharField(required=False, allow_null=True)
    created_at = serializers.DateTimeField()
    paid_amount = serializers.FloatField()
    remaining_amount = serializers.FloatField()
