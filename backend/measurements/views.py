from rest_framework import viewsets, status
from rest_framework.response import Response
import json

from .models import MeasurementTemplate, Measurement
from .serializers import MeasurementTemplateSerializer, MeasurementSerializer


class MeasurementTemplateViewSet(viewsets.ModelViewSet):
    queryset = MeasurementTemplate.objects.all()
    serializer_class = MeasurementTemplateSerializer

    def get_queryset(self):
        from django.db.models import Q
        queryset = MeasurementTemplate.objects.all()
        garment_type = self.request.query_params.get('garment_type', None)
        gender = self.request.query_params.get('gender', None)
        
        if garment_type:
            queryset = queryset.filter(garment_type=garment_type)
        if gender:
            # Return templates matching the gender OR unisex templates
            queryset = queryset.filter(Q(gender=gender) | Q(gender='unisex'))
        
        return queryset.order_by('-id')


class MeasurementViewSet(viewsets.ModelViewSet):
    queryset = Measurement.objects.select_related('customer', 'template').all()
    serializer_class = MeasurementSerializer

    def get_queryset(self):
        queryset = Measurement.objects.select_related('customer', 'template').all()
        customer_id = self.request.query_params.get('customer_id', None)
        garment_type = self.request.query_params.get('garment_type', None)
        
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        if garment_type:
            queryset = queryset.filter(garment_type=garment_type)
        
        return queryset.order_by('-id')

    def create(self, request, *args, **kwargs):
        # Handle customer_id and template_id from frontend
        data = request.data.copy()
        
        # Convert customer_id to customer object
        if 'customer_id' in data:
            from customers.models import Customer
            try:
                customer = Customer.objects.get(id=data.pop('customer_id'))
                data['customer'] = customer.id
            except Customer.DoesNotExist:
                return Response(
                    {'customer_id': ['Invalid customer ID']},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Convert template_id to template object
        if 'template_id' in data:
            try:
                template = MeasurementTemplate.objects.get(id=data.pop('template_id'))
                data['template'] = template.id
            except MeasurementTemplate.DoesNotExist:
                return Response(
                    {'template_id': ['Invalid template ID']},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Handle measurements_json update
        if 'measurements_json' in request.data:
            measurements_json = request.data['measurements_json']
            if isinstance(measurements_json, str):
                measurements_json = json.loads(measurements_json)
            instance.measurements_json = measurements_json
            instance.save()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
