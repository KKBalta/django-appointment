from django.urls import path
from . import views

app_name = 'barbershop'

urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('services/', views.services, name='services'),
    path('book/', views.service_directory, name='service_directory'),
    path('gallery/', views.gallery, name='gallery'),
    path('contact/', views.contact, name='contact'),
    path('staff/', views.staff_listing, name='staff_listing'),
]