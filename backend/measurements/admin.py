from django.contrib import admin
from .models import MeasurementTemplate, Measurement


@admin.register(MeasurementTemplate)
class MeasurementTemplateAdmin(admin.ModelAdmin):
    list_display = ('id', 'display_name', 'garment_type', 'gender', 'created_at')
    list_filter = ('garment_type', 'gender', 'created_at')
    search_fields = ('display_name', 'garment_type')
    readonly_fields = ('created_at',)
    ordering = ('-id',)


@admin.register(Measurement)
class MeasurementAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'garment_type', 'template', 'created_at')
    list_filter = ('garment_type', 'template', 'created_at')
    search_fields = ('customer__name', 'customer__phone', 'garment_type')
    readonly_fields = ('created_at',)
    ordering = ('-id',)
    autocomplete_fields = ('customer', 'template')
