from django.db import models
from orders.models import Order


class Staff(models.Model):
    ROLE_CHOICES = [
        ('master_tailor', 'Master Tailor'),
        ('tailor', 'Tailor'),
        ('assistant_tailor', 'Assistant Tailor'),
        ('cutting_master', 'Cutting Master'),
        ('sewing_operator', 'Sewing Operator'),
        ('finishing', 'Finishing'),
        ('receptionist', 'Receptionist'),
        ('delivery_person', 'Delivery Person'),
        ('accountant', 'Accountant'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    address = models.TextField(blank=True, null=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    join_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'staff'
        ordering = ['-id']

    def __str__(self):
        return self.name


class OrderStaffAssignment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='staff_assignments')
    staff = models.ForeignKey('Staff', on_delete=models.CASCADE, related_name='order_assignments')
    assigned_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'order_staff_assignments'
        unique_together = [['order', 'staff']]
        ordering = ['-assigned_date', '-id']

    def __str__(self):
        return f"{self.staff.name} -> Order #{self.order.id}"
