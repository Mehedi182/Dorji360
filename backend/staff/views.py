from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.utils import timezone

from .models import Staff, OrderStaffAssignment
from .serializers import StaffSerializer


class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer

    def get_queryset(self):
        queryset = Staff.objects.all()
        role = self.request.query_params.get('role', None)
        
        if role:
            queryset = queryset.filter(role=role)
        
        return queryset.order_by('-id')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Use current date if join_date not provided
        if 'join_date' not in serializer.validated_data or not serializer.validated_data.get('join_date'):
            serializer.validated_data['join_date'] = timezone.now().date()
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Check if staff is assigned to any orders
        assignment_count = OrderStaffAssignment.objects.filter(staff=instance).count()
        if assignment_count > 0:
            raise ValidationError(
                f"Cannot delete staff member. They are assigned to {assignment_count} order(s)."
            )
        
        self.perform_destroy(instance)
        return Response({"message": "Staff member deleted successfully"}, status=status.HTTP_200_OK)
