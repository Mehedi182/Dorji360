from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .deliveries import DeliveryViewSet

router = DefaultRouter()
router.register(r'', DeliveryViewSet, basename='delivery')

urlpatterns = [
    path('', include(router.urls)),
]

