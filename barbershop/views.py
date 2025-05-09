# barbershop/views.py
from django.shortcuts import render
from appointment.models import StaffMember, Service

def home(request):
    # Get all staff members without filtering by is_active (since this field doesn't exist)
    staff_members = StaffMember.objects.all()
    
    # For services, keep the same filter if Service model has is_active field
    try:
        services = Service.objects.filter(is_active=True)[:4]
    except:
        # Fallback if Service model also doesn't have is_active
        services = Service.objects.all()[:4]
    
    context = {
        'staff_members': staff_members,
        'services': services,
    }
    
    return render(request, 'barbershop/home.html', context)

def about(request):
    return render(request, 'barbershop/about.html')

def services(request):
    services = Service.objects.all()
    return render(request, 'barbershop/services.html', {'services': services})

def service_directory(request):
    services = Service.objects.all()
    return render(request, 'barbershop/service_directory.html', {'services': services})

def gallery(request):
    return render(request, 'barbershop/gallery.html')

def contact(request):
    staff_members = StaffMember.objects.all()
    return render(request, 'barbershop/contact.html', {'staff_members': staff_members})

def staff_listing(request):
    # Get all staff members without filtering by is_active
    staff_members = StaffMember.objects.all()
    
    context = {
        'staff_members': staff_members,
        'page_title': 'Our Expert Barbers - Your Barbershop',
        'page_description': 'Meet our team of skilled barbers and stylists ready to give you the perfect look.'
    }
    
    return render(request, 'barbershop/staff_listing.html', context)
