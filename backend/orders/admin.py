from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1
    fields = ('garment_type', 'quantity', 'price', 'fabric_details')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'order_date', 'delivery_date', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'order_date', 'delivery_date', 'created_at')
    search_fields = ('customer__name', 'customer__phone', 'id')
    readonly_fields = ('created_at', 'total_amount')
    ordering = ('-id',)
    inlines = [OrderItemInline]
    autocomplete_fields = ('customer',)
    date_hierarchy = 'order_date'


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'garment_type', 'quantity', 'price', 'fabric_details')
    list_filter = ('garment_type',)
    search_fields = ('order__id', 'garment_type', 'fabric_details')
    autocomplete_fields = ('order',)
