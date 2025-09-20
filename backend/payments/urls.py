from django.urls import path
from . import views

urlpatterns = [
    # Payment management
    path('', views.payment_list, name='payment_list'),
    path('create/', views.create_payment, name='create_payment'),
    path('<int:payment_id>/', views.payment_detail, name='payment_detail'),
    
    # Payment processing
    path('paystack/', views.process_paystack_payment, name='process_paystack_payment'),
    
    # Mobile Money API endpoints
    path('initiate/', views.initiate_momo_payment, name='initiate_momo_payment'),
    path('verify/', views.verify_momo_payment, name='verify_momo_payment'),
]
