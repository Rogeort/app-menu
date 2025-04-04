from django.db import models
from django.core.validators import MinValueValidator, URLValidator
from django.utils.text import slugify
from django.utils import timezone

class Category(models.Model):
    """Menu category with name, description, and display order"""
    CATEGORY_TYPES = [
        ('APP', 'Appetizers'),
        ('MAIN', 'Main Courses'),
        ('SIDE', 'Side Dishes'),
        ('DESS', 'Desserts'),
        ('BEV', 'Beverages'),
        ('SPEC', 'Specialties'),
    ]
    
    
    name = models.CharField(
        max_length=4,
        choices=CATEGORY_TYPES,
        unique=True,
        help_text="Type of menu category"
    )
    display_name = models.CharField(
        max_length=50,
        help_text="User-friendly display name"
    )
    short_description = models.CharField(
        max_length=200,
        blank=True,
        help_text="Brief description for menu listings"
    )
    long_description = models.TextField(
        blank=True,
        help_text="Detailed description for category pages"
    )
    display_order = models.PositiveSmallIntegerField(
        default=0,
        help_text="Order in which category appears in menu"
    )
    active = models.BooleanField(
        default=True,
        help_text="Whether this category appears in menus"
    )
    image_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        validators=[URLValidator()],
        help_text="URL of category image"
    )
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['display_order', 'name']
    
    def __str__(self):
        return self.get_name_display()
    
    def save(self, *args, **kwargs):
        if not self.display_name:
            self.display_name = self.get_name_display()
        super().save(*args, **kwargs)

class Dish(models.Model):
    """Menu item with multiple description levels and category relationship"""
    name = models.CharField(
        max_length=200,
        help_text="Name of the dish as it appears on the menu"
    )
    slug = models.SlugField(
        max_length=200,
        unique=True,
        blank=True,
        help_text="URL-friendly version of the name"
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='dishes',
        help_text="Menu category this dish belongs to",
        null=True,  # Allow NULL in database
    blank=True,  # Allow blank in forms
    )
    price = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Price in local currency"
    )
    short_description = models.CharField(
        max_length=200,
        blank=True,
        help_text="Brief description for menu listings"
    )
    full_description = models.TextField(
        blank=True,
        help_text="Detailed description with ingredients, preparation, etc."
    )
    is_vegetarian = models.BooleanField(
        default=False,
        help_text="Is this a vegetarian dish?"
    )
    is_vegan = models.BooleanField(
        default=False,
        help_text="Is this a vegan dish?"
    )
    is_gluten_free = models.BooleanField(
        default=False,
        help_text="Is this gluten-free?"
    )
    is_spicy = models.BooleanField(
        default=False,
        help_text="Is this dish spicy?"
    )
    calories = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text="Approximate calorie count"
    )
    preparation_time = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text="Average preparation time in minutes"
    )
    image_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        validators=[URLValidator()],
        help_text="URL of high-quality dish image"
    )
    thumbnail_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        validators=[URLValidator()],
        help_text="URL of thumbnail image"
    )
    display_order = models.PositiveSmallIntegerField(
        default=0,
        help_text="Order in which dish appears in category"
    )
    active = models.BooleanField(
        default=True,
        help_text="Whether this dish appears on menus"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When this dish was added to the menu"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="When this dish was last modified"
    )
    
    
    
    class Meta:
        verbose_name_plural = "Dishes"
        ordering = ['category__display_order', 'display_order', 'name']
    
    def __str__(self):
        return f"{self.name} (${self.price})"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class Sale(models.Model):
    product_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(default=timezone.now)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Price at time of sale

    class Meta:
        ordering = ['-created_at']  # Newest sales first

    def __str__(self):
        return f"{self.quantity}x {self.product_name} at {self.created_at}"