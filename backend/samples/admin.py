from django.contrib import admin
from .models import Sample, SampleImage


class SampleImageInline(admin.TabularInline):
    model = SampleImage
    extra = 1
    fields = ('image_url', 'display_order')


@admin.register(Sample)
class SampleAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'garment_type', 'created_at')
    list_filter = ('garment_type', 'created_at')
    search_fields = ('title', 'description', 'garment_type')
    readonly_fields = ('created_at',)
    ordering = ('-id',)
    inlines = [SampleImageInline]


@admin.register(SampleImage)
class SampleImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sample', 'display_order', 'created_at')
    list_filter = ('sample__garment_type', 'created_at')
    search_fields = ('sample__title', 'sample__garment_type')
    readonly_fields = ('created_at',)
    ordering = ('display_order', 'id')
    autocomplete_fields = ('sample',)
