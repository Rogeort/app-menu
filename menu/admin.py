from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Dish, Sale

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_name', 'display_order', 'active')
    list_editable = ('display_order', 'active')
    list_filter = ('active', 'name')
    search_fields = ('display_name', 'short_description')
    fieldsets = (
        (None, {
            'fields': ('name', 'display_name', 'display_order', 'active')
        }),
        ('Descriptions', {
            'fields': ('short_description', 'long_description'),
            'classes': ('collapse',)
        }),
        ('Media', {
            'fields': ('image_url',),
            'classes': ('collapse',)
        }),
    )

class DishAdmin(admin.ModelAdmin):
    list_display = (
        'name', 
        'category', 
        'price', 
        'is_vegetarian', 
        'is_vegan', 
        'is_gluten_free',
        'active'
    )
    list_editable = ('price', 'active')
    list_filter = (
        'category', 
        'active', 
        'is_vegetarian', 
        'is_vegan', 
        'is_gluten_free',
        'is_spicy'
    )
    search_fields = ('name', 'short_description', 'full_description')
    readonly_fields = ('created_at', 'updated_at', 'dish_image_preview')
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'name', 
                'slug', 
                'category', 
                'price', 
                'active',
                'display_order'
            )
        }),
        ('Descriptions', {
            'fields': ('short_description', 'full_description'),
            'classes': ('wide',)
        }),
        ('Dietary Information', {
            'fields': (
                'is_vegetarian', 
                'is_vegan', 
                'is_gluten_free',
                'is_spicy'
            ),
            'classes': ('collapse',)
        }),
        ('Nutrition & Preparation', {
            'fields': ('calories', 'preparation_time'),
            'classes': ('collapse',)
        }),
        ('Media', {
            'fields': (
                'image_url', 
                'thumbnail_url',
                'dish_image_preview'
            ),
            'classes': ('wide',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def dish_image_preview(self, obj):
        if obj.image_url:
            return format_html(
                '<img src="{}" style="max-height: 200px;"/>',
                obj.image_url
            )
        return "-"
    dish_image_preview.short_description = "Image Preview"



admin.site.register(Category, CategoryAdmin)
admin.site.register(Dish, DishAdmin)
admin.site.register(Sale)