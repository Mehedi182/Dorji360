"""
URL configuration for dorji360 project.
"""
from django.contrib import admin
from django.urls import path, include

from measurements.views import MeasurementViewSet
from rest_framework.routers import DefaultRouter

measurement_router = DefaultRouter()
measurement_router.register(r'', MeasurementViewSet, basename='measurement')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/customers/', include('customers.urls')),
    path('api/measurement-templates/', include('measurements.urls')),
    path('api/measurements/', include(measurement_router.urls)),
    path('api/orders/', include('orders.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/deliveries/', include('orders.deliveries_urls')),
    path('api/samples/', include('samples.urls')),
    path('api/staff/', include('staff.urls')),
]
