from customers.models import Customer
from django.db import models


class MeasurementTemplate(models.Model):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('unisex', 'Unisex'),
    ]

    garment_type = models.CharField(max_length=100)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    fields_json = models.JSONField()  # field_name -> display_name
    display_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'measurement_templates'
        ordering = ['-id']

    def __str__(self):
        return f"{self.display_name} ({self.garment_type})"


class Measurement(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='measurements')
    garment_type = models.CharField(max_length=100)
    template = models.ForeignKey('MeasurementTemplate', on_delete=models.PROTECT, related_name='measurements')
    measurements_json = models.JSONField()  # field_name -> value
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'measurements'
        ordering = ['-id']

    def __str__(self):
        return f"{self.customer.name} - {self.garment_type}"
