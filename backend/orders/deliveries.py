"""
Delivery views - Delivery is Order with computed fields, not a separate model
"""
from rest_framework import viewsets
from rest_framework.response import Response
from django.db.models import Sum

from .models import Order
from payments.serializers import DeliverySerializer


class DeliveryViewSet(viewsets.ViewSet):
    """Delivery is Order with computed fields - not a separate model"""
    
    def list(self, request):
        queryset = Order.objects.select_related('customer').prefetch_related('payments').all()
        
        start_date = request.query_params.get('start_date', None)
        end_date = request.query_params.get('end_date', None)
        status_filter = request.query_params.get('status', None)
        
        if start_date:
            queryset = queryset.filter(delivery_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(delivery_date__lte=end_date)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        deliveries = []
        for order in queryset.order_by('-id'):
            paid_amount = order.payments.aggregate(total=Sum('amount'))['total'] or 0
            deliveries.append({
                'id': order.id,
                'customer_id': order.customer_id,
                'customer_name': order.customer.name,
                'customer_phone': order.customer.phone,
                'order_date': order.order_date.isoformat(),
                'delivery_date': order.delivery_date.isoformat(),
                'status': order.status,
                'total_amount': float(order.total_amount),
                'notes': order.notes,
                'created_at': order.created_at.isoformat(),
                'paid_amount': float(paid_amount),
                'remaining_amount': float(order.total_amount) - float(paid_amount),
            })
        
        serializer = DeliverySerializer(deliveries, many=True)
        return Response(serializer.data)

