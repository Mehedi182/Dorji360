from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'amount', 'payment_type', 'payment_method', 'date', 'created_at')
    list_filter = ('payment_type', 'payment_method', 'date', 'created_at')
    search_fields = ('order__id', 'order__customer__name', 'notes')
    readonly_fields = ('created_at',)
    ordering = ('-id',)
    autocomplete_fields = ('order',)
    date_hierarchy = 'date'
