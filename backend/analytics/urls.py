# analytics/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.test_analytics, name='test_analytics'),
    path('vendor/<str:vendor_id>/', views.vendor_analytics, name='vendor_analytics'),
    path('service/<int:service_id>/', views.service_analytics, name='service_analytics'),
]
