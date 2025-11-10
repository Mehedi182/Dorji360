from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from django.utils import timezone

from .models import Payment
from .serializers import PaymentSerializer
from orders.models import Order


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

    def get_queryset(self):
        queryset = Payment.objects.all()
        order_id = self.request.query_params.get('order_id', None)
        
        if order_id:
            queryset = queryset.filter(order_id=order_id)
        
        return queryset.order_by('-id')

    def create(self, request, *args, **kwargs):
        # Handle order_id in request data - convert to order
        data = request.data.copy()
        if 'order_id' in data and 'order' not in data:
            order_id = data.pop('order_id')
            try:
                order = Order.objects.get(id=order_id)
                data['order'] = order.id
            except Order.DoesNotExist:
                raise NotFound("Order not found")
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # Create payment instance with validated data
        payment = Payment.objects.create(
            order=serializer.validated_data['order'],
            amount=serializer.validated_data['amount'],
            payment_type=serializer.validated_data['payment_type'],
            payment_method=serializer.validated_data['payment_method'],
            date=serializer.validated_data.get('date', timezone.now().date()),
            notes=serializer.validated_data.get('notes', '')
        )
        
        response_serializer = PaymentSerializer(payment)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
