from django.db import models


class Customer(models.Model):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('unisex', 'Unisex'),
    ]

    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='unisex')
    address = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'customers'
        ordering = ['-id']

    def __str__(self):
        return self.name
