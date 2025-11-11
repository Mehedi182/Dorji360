from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError
from django.utils import timezone

from .models import Order, OrderItem
from .serializers import (
    OrderSerializer, OrderWithDetailsSerializer, OrderCreateSerializer
)
from staff.models import Staff, OrderStaffAssignment
from staff.serializers import OrderStaffAssignmentSerializer, OrderStaffAssignmentCreateSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('customer').prefetch_related('items', 'payments', 'staff_assignments__staff').all()
    serializer_class = OrderSerializer

    def get_queryset(self):
        queryset = Order.objects.select_related('customer').prefetch_related('items', 'payments', 'staff_assignments__staff').all()
        customer_id = self.request.query_params.get('customer_id', None)
        status_filter = self.request.query_params.get('status', None)
        
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-id')

    def get_serializer_class(self):
        if self.action == 'retrieve' or self.action == 'list':
            return OrderWithDetailsSerializer
        elif self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = OrderWithDetailsSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = OrderWithDetailsSerializer(instance)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        order_date = data.get('order_date') or timezone.now().date()
        
        # Create order
        order = Order.objects.create(
            customer_id=data['customer_id'],
            order_date=order_date,
            delivery_date=data['delivery_date'],
            notes=data.get('notes', ''),
            total_amount=0  # Will be calculated
        )
        
        # Create order items and calculate total
        total_amount = 0
        for item_data in data['items']:
            measurement_id = item_data.get('measurement_id')
            measurement = None
            if measurement_id:
                from measurements.models import Measurement
                try:
                    measurement = Measurement.objects.get(id=measurement_id)
                except Measurement.DoesNotExist:
                    pass  # Skip invalid measurement ID
            
            item = OrderItem.objects.create(
                order=order,
                garment_type=item_data['garment_type'],
                quantity=item_data['quantity'],
                price=item_data['price'],
                fabric_details=item_data.get('fabric_details', ''),
                measurement=measurement
            )
            total_amount += float(item.price) * item.quantity
        
        order.total_amount = total_amount
        order.save()
        
        # Assign staff if provided
        if data.get('assigned_staff_ids'):
            for staff_id in data['assigned_staff_ids']:
                try:
                    staff = Staff.objects.get(id=staff_id)
                    OrderStaffAssignment.objects.get_or_create(
                        order=order,
                        staff=staff,
                        defaults={'assigned_date': timezone.now().date()}
                    )
                except Staff.DoesNotExist:
                    pass  # Skip invalid staff IDs
        
        response_serializer = OrderWithDetailsSerializer(order)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Only allow updating status, delivery_date, notes
        serializer = OrderSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        response_serializer = OrderWithDetailsSerializer(instance)
        return Response(response_serializer.data)

    @action(detail=True, methods=['get'], url_path='staff')
    def get_staff(self, request, pk=None):
        """Get staff assigned to an order"""
        order = self.get_object()
        assignments = order.staff_assignments.select_related('staff').all()
        serializer = OrderStaffAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='staff')
    def assign_staff(self, request, pk=None):
        """Assign staff to an order"""
        order = self.get_object()
        serializer = OrderStaffAssignmentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        staff_id = data['staff_id']
        
        try:
            staff = Staff.objects.get(id=staff_id)
        except Staff.DoesNotExist:
            raise NotFound("Staff member not found")
        
        # Check if already assigned
        if OrderStaffAssignment.objects.filter(order=order, staff=staff).exists():
            raise ValidationError("Staff member is already assigned to this order")
        
        assigned_date = data.get('assigned_date') or timezone.now().date()
        assignment = OrderStaffAssignment.objects.create(
            order=order,
            staff=staff,
            assigned_date=assigned_date,
            notes=data.get('notes', '')
        )
        
        response_serializer = OrderStaffAssignmentSerializer(assignment)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='staff/(?P<assignment_id>[^/.]+)')
    def remove_staff(self, request, pk=None, assignment_id=None):
        """Remove staff assignment from an order"""
        order = self.get_object()
        try:
            assignment = OrderStaffAssignment.objects.get(id=assignment_id, order=order)
            assignment.delete()
            return Response({"message": "Staff assignment removed successfully"}, status=status.HTTP_200_OK)
        except OrderStaffAssignment.DoesNotExist:
            raise NotFound("Staff assignment not found")

    def destroy(self, request, *args, **kwargs):
        """Delete an order and its related items"""
        instance = self.get_object()
        try:
            # Django CASCADE will automatically delete related items and staff assignments
            # Payments will also be deleted due to CASCADE
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {"detail": f"Failed to delete order: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
