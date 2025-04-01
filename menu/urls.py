from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path('api/sales/create/', views.checkout, name="Create_sale")
]