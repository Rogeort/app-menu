from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
import json
from django.template import loader
from .models import Sale
# Create your views here.

from .models import Dish


def index(request):
    latest_dish_list = Dish.objects.order_by("-price")
    template = loader.get_template("menu/index.html")
    context = {
        'latest_dish_list': latest_dish_list,
    }

    return HttpResponse(template.render(context, request))


@csrf_exempt
def checkout(request):
    if request.method == 'POST':
        print("Request method:", request.method)  # Debug
        print("Content-Type:", request.headers.get('Content-Type'))  # Debug
        if request.method == 'POST':
            try:
                # Print raw body for debugging
                raw_body = request.body.decode('utf-8')
                print("Raw request body:", raw_body)
                
                data = json.loads(raw_body)
                
                for item in data['items']:
                    Sale.objects.create(
                        product_name = item['id'],
                        quantity = item['quantity'],
                        price = item['price']
                    )
                
                # Your processing logic here
                return JsonResponse({'status': 'success', 'received_data': data})
                
            except json.JSONDecodeError as e:
                print("JSON decode error:", e)
                return JsonResponse({'error': 'Invalid JSON'}, status=400)
            except Exception as e:
                print("Error:", e)
                return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)