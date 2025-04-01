from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
# Create your views here.

from .models import Dish


def index(request):
    latest_dish_list = Dish.objects.order_by("-price")
    template = loader.get_template("menu/index.html")
    context = {
        'latest_dish_list': latest_dish_list,
    }

    return HttpResponse(template.render(context, request))



