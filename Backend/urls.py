from django.urls import path
from . import views

urlpatterns = [
    # Login route
    path('api/login/', views.login_view, name='login'),
    
    # Customer routes
    path('customers/add/', views.customers_list_or_add, name='customers_add'),
    path('customers/', views.customers_list_or_add, name='customers_list'),
    path('customers/update/<int:id>/', views.customer_update_or_delete, name='customer_update'),
    path('customers/delete/<int:id>/', views.customer_update_or_delete, name='customer_delete'),
    
    # Driver routes
    path('drivers/add/', views.drivers_list_or_add, name='drivers_add'),
    path('drivers/', views.drivers_list_or_add, name='drivers_list'),
    path('drivers/update/<int:id>/', views.driver_update_or_delete, name='driver_update'),
    path('drivers/delete/<int:id>/', views.driver_update_or_delete, name='driver_delete'),

    # Vehicle routes
    path('vehicles/add/', views.vehicles_list_or_add, name='vehicles_add'),
    path('vehicles/', views.vehicles_list_or_add, name='vehicles_list'),
    path('vehicles/update/<int:id>/', views.vehicle_update_or_delete, name='vehicle_update'),
    path('vehicles/delete/<int:id>/', views.vehicle_update_or_delete, name='vehicle_delete'),

    # Booking routes
    path('bookings/add/', views.bookings_list_or_add, name='bookings_add'),
    path('bookings/', views.bookings_list_or_add, name='bookings_list'),
    path('bookings/update/<int:id>/', views.booking_update_or_delete, name='booking_update'),
    path('bookings/delete/<int:id>/', views.booking_update_or_delete, name='booking_delete'),

    # Payment routes
    path('payments/add/', views.payments_list_or_add, name='payments_add'),
    path('payments/', views.payments_list_or_add, name='payments_list'),
    path('payments/update/<int:id>/', views.payment_update_or_delete, name='payment_update'),
    path('payments/delete/<int:id>/', views.payment_update_or_delete, name='payment_delete'),
]
