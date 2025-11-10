from django.db import models


class Sample(models.Model):
    garment_type = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'samples'
        ordering = ['-id']

    def __str__(self):
        return self.title


class SampleImage(models.Model):
    sample = models.ForeignKey('Sample', on_delete=models.CASCADE, related_name='images')
    image_url = models.TextField()
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sample_images'
        ordering = ['display_order', 'id']

    def __str__(self):
        return f"Image for {self.sample.title}"
