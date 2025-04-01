from django.db import models

# Create your models here.


class Dish(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(decimal_places=2, max_digits=5)