from django.core.validators import MinValueValidator
from django.db import models
from customers.models import Customer


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('cutting', 'Cutting'),
        ('sewing', 'Sewing'),
        ('ready', 'Ready'),
        ('delivered', 'Delivered'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    order_date = models.DateField(auto_now_add=True)
    delivery_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-id']

    def __str__(self):
        return f"Order #{self.id} - {self.customer.name}"


class OrderItem(models.Model):
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='items')
    garment_type = models.CharField(max_length=100)
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    fabric_details = models.TextField(blank=True, null=True)
    measurement = models.ForeignKey('measurements.Measurement', on_delete=models.SET_NULL, null=True, blank=True, related_name='order_items')

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f"{self.garment_type} x{self.quantity}"
