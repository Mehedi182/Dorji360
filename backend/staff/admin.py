from django.contrib import admin
from .models import Staff, OrderStaffAssignment


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'phone', 'role', 'join_date', 'created_at')
    list_filter = ('role', 'join_date', 'created_at')
    search_fields = ('name', 'phone', 'address')
    readonly_fields = ('created_at',)
    ordering = ('-id',)
    date_hierarchy = 'join_date'


@admin.register(OrderStaffAssignment)
class OrderStaffAssignmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'staff', 'assigned_date', 'created_at')
    list_filter = ('assigned_date', 'created_at')
    search_fields = ('order__id', 'staff__name', 'notes')
    readonly_fields = ('created_at',)
    ordering = ('-assigned_date', '-id')
    autocomplete_fields = ('order', 'staff')
    date_hierarchy = 'assigned_date'
