from django.contrib import admin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'phone', 'gender', 'address', 'created_at')
    list_filter = ('gender', 'created_at')
    search_fields = ('name', 'phone', 'address')
    readonly_fields = ('created_at',)
    ordering = ('-id',)
