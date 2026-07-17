import sys
import os
from pathlib import Path

# Add project root to python path to import Backend/db
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from Backend.db import customers_col, drivers_col, vehicles_col, bookings_col, payments_col

def seed():
    print("Clearing collections...")
    customers_col.delete_many({})
    drivers_col.delete_many({})
    vehicles_col.delete_many({})
    bookings_col.delete_many({})
    payments_col.delete_many({})
    
    print("Seeding customer...")
    customers_col.insert_one({
        "customer_id": 101,
        "full_name": "Rahul Sharma",
        "email": "rahul@gmail.com",
        "phone": "9876543210",
        "address": "Hyderabad",
        "password": "rahul123"
    })
    
    print("Seeding driver...")
    drivers_col.insert_one({
        "driver_id": 201,
        "driver_name": "Ramesh Kumar",
        "email": "ramesh@gmail.com",
        "phone": "9988776655",
        "license_number": "DL123456789",
        "experience": 5,
        "availability": "Available"
    })
    
    print("Seeding vehicle...")
    vehicles_col.insert_one({
        "vehicle_id": 301,
        "driver_name": "Ramesh Kumar",
        "vehicle_type": "Sedan",
        "vehicle_number": "TS09AB1234",
        "seating_capacity": 4,
        "model": "Hyundai Verna"
    })
    
    print("Seeding booking...")
    bookings_col.insert_one({
        "booking_id": 401,
        "customer_name": "Rahul Sharma",
        "driver_name": "Ramesh Kumar",
        "pickup_location": "Madhapur",
        "drop_location": "Gachibowli",
        "booking_date": "2026-08-15",
        "fare": 350,
        "ride_status": "Accepted"
    })
    
    print("Seeding payment...")
    payments_col.insert_one({
        "payment_id": 501,
        "booking_id": 401,
        "customer_name": "Rahul Sharma",
        "amount": 350,
        "payment_method": "UPI",
        "payment_status": "Success",
        "transaction_id": "TXN456789123",
        "payment_date": "2026-08-15"
    })
    
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed()
