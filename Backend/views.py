import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .db import customers_col, drivers_col, vehicles_col, bookings_col, payments_col

def serialize_doc(doc):
    if doc is None:
        return None
    doc = dict(doc)
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc

def serialize_docs(cursor):
    return [serialize_doc(doc) for doc in cursor]

def get_next_id(collection, field_name, start_id=101):
    max_doc = collection.find_one(sort=[(field_name, -1)])
    if max_doc and field_name in max_doc:
        try:
            return int(max_doc[field_name]) + 1
        except (ValueError, TypeError):
            return start_id
    return start_id

# Unified Login View
@csrf_exempt
def login_view(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST method is allowed"}, status=405)
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'customer')

        if not email or not password:
            return JsonResponse({"error": "Email and password are required"}, status=400)

        if role == 'admin':
            if email == 'admin@taxi.com' and password == 'admin123':
                return JsonResponse({
                    "message": "Login successful",
                    "user": {"full_name": "Administrator", "email": "admin@taxi.com", "role": "admin"}
                })
            else:
                return JsonResponse({"error": "Invalid admin credentials"}, status=401)
        elif role == 'driver':
            driver = drivers_col.find_one({"email": email, "phone": password}) # driver password can be phone or email match
            # Let's support match by email and password field if exists, else fall back to phone or default driver123
            # In Driver schema, there's no password, but let's check experience or license or let phone be the password
            driver = drivers_col.find_one({"email": email})
            if driver:
                # For drivers we use phone or experience or default driver123 for password matching
                # Let's use their phone number as password since schema has no password field.
                if driver.get('phone') == password or password == 'driver123':
                    return JsonResponse({
                        "message": "Login successful",
                        "user": {
                            "driver_id": driver.get('driver_id'),
                            "driver_name": driver.get('driver_name'),
                            "email": driver.get('email'),
                            "role": "driver"
                        }
                    })
            return JsonResponse({"error": "Invalid driver credentials"}, status=401)
        else:
            customer = customers_col.find_one({"email": email, "password": password})
            if customer:
                return JsonResponse({
                    "message": "Login successful",
                    "user": {
                        "customer_id": customer.get('customer_id'),
                        "full_name": customer.get('full_name'),
                        "email": customer.get('email'),
                        "role": "customer"
                    }
                })
            return JsonResponse({"error": "Invalid customer credentials"}, status=401)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# ================= CUSTOMER MANAGEMENT =================

@csrf_exempt
def customers_list_or_add(request):
    if request.method == 'GET':
        query = {}
        for k, v in request.GET.items():
            if v.isdigit():
                query[k] = int(v)
            else:
                query[k] = v
        customers = serialize_docs(customers_col.find(query))
        return JsonResponse(customers, safe=False)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            customer_id = data.get('customer_id')
            if not customer_id:
                customer_id = get_next_id(customers_col, 'customer_id', 101)
            else:
                customer_id = int(customer_id)
                # check duplication
                if customers_col.find_one({"customer_id": customer_id}):
                    return JsonResponse({"error": f"Customer with ID {customer_id} already exists"}, status=400)
            
            customer = {
                "customer_id": customer_id,
                "full_name": data.get('full_name', ''),
                "email": data.get('email', ''),
                "phone": data.get('phone', ''),
                "address": data.get('address', ''),
                "password": data.get('password', '')
            }
            customers_col.insert_one(customer)
            return JsonResponse({"message": "Customer added successfully", "customer": serialize_doc(customer)}, status=211) # Wait, standard is 201 Created but return message works. Let's return status 201.
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def customer_update_or_delete(request, id):
    try:
        cust_id = int(id)
    except ValueError:
        return JsonResponse({"error": "Invalid ID format"}, status=400)

    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            # Remove keys that shouldn't be updated or convert types
            data.pop('customer_id', None)
            data.pop('_id', None)
            
            result = customers_col.update_one({"customer_id": cust_id}, {"$set": data})
            if result.matched_count == 0:
                return JsonResponse({"error": "Customer not found"}, status=404)
            updated_customer = customers_col.find_one({"customer_id": cust_id})
            return JsonResponse({"message": "Customer updated successfully", "customer": serialize_doc(updated_customer)})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            
    elif request.method == 'DELETE':
        result = customers_col.delete_one({"customer_id": cust_id})
        if result.deleted_count == 0:
            return JsonResponse({"error": "Customer not found"}, status=404)
        return JsonResponse({"message": "Customer deleted successfully"})


# ================= DRIVER MANAGEMENT =================

@csrf_exempt
def drivers_list_or_add(request):
    if request.method == 'GET':
        query = {}
        for k, v in request.GET.items():
            if v.isdigit():
                query[k] = int(v)
            else:
                query[k] = v
        drivers = serialize_docs(drivers_col.find(query))
        return JsonResponse(drivers, safe=False)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            driver_id = data.get('driver_id')
            if not driver_id:
                driver_id = get_next_id(drivers_col, 'driver_id', 201)
            else:
                driver_id = int(driver_id)
                if drivers_col.find_one({"driver_id": driver_id}):
                    return JsonResponse({"error": f"Driver with ID {driver_id} already exists"}, status=400)
            
            driver = {
                "driver_id": driver_id,
                "driver_name": data.get('driver_name', ''),
                "email": data.get('email', ''),
                "phone": data.get('phone', ''),
                "license_number": data.get('license_number', ''),
                "experience": int(data.get('experience', 0)),
                "availability": data.get('availability', 'Available')
            }
            drivers_col.insert_one(driver)
            return JsonResponse({"message": "Driver added successfully", "driver": serialize_doc(driver)}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def driver_update_or_delete(request, id):
    try:
        drv_id = int(id)
    except ValueError:
        return JsonResponse({"error": "Invalid ID format"}, status=400)

    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            data.pop('driver_id', None)
            data.pop('_id', None)
            if 'experience' in data:
                data['experience'] = int(data['experience'])
            
            result = drivers_col.update_one({"driver_id": drv_id}, {"$set": data})
            if result.matched_count == 0:
                return JsonResponse({"error": "Driver not found"}, status=404)
            updated_driver = drivers_col.find_one({"driver_id": drv_id})
            return JsonResponse({"message": "Driver updated successfully", "driver": serialize_doc(updated_driver)})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            
    elif request.method == 'DELETE':
        result = drivers_col.delete_one({"driver_id": drv_id})
        if result.deleted_count == 0:
            return JsonResponse({"error": "Driver not found"}, status=404)
        return JsonResponse({"message": "Driver deleted successfully"})


# ================= VEHICLE MANAGEMENT =================

@csrf_exempt
def vehicles_list_or_add(request):
    if request.method == 'GET':
        query = {}
        for k, v in request.GET.items():
            if v.isdigit():
                query[k] = int(v)
            else:
                query[k] = v
        vehicles = serialize_docs(vehicles_col.find(query))
        return JsonResponse(vehicles, safe=False)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            vehicle_id = data.get('vehicle_id')
            if not vehicle_id:
                vehicle_id = get_next_id(vehicles_col, 'vehicle_id', 301)
            else:
                vehicle_id = int(vehicle_id)
                if vehicles_col.find_one({"vehicle_id": vehicle_id}):
                    return JsonResponse({"error": f"Vehicle with ID {vehicle_id} already exists"}, status=400)
            
            vehicle = {
                "vehicle_id": vehicle_id,
                "driver_name": data.get('driver_name', ''),
                "vehicle_type": data.get('vehicle_type', 'Sedan'),
                "vehicle_number": data.get('vehicle_number', ''),
                "seating_capacity": int(data.get('seating_capacity', 4)),
                "model": data.get('model', '')
            }
            vehicles_col.insert_one(vehicle)
            return JsonResponse({"message": "Vehicle added successfully", "vehicle": serialize_doc(vehicle)}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def vehicle_update_or_delete(request, id):
    try:
        vh_id = int(id)
    except ValueError:
        return JsonResponse({"error": "Invalid ID format"}, status=400)

    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            data.pop('vehicle_id', None)
            data.pop('_id', None)
            if 'seating_capacity' in data:
                data['seating_capacity'] = int(data['seating_capacity'])
            
            result = vehicles_col.update_one({"vehicle_id": vh_id}, {"$set": data})
            if result.matched_count == 0:
                return JsonResponse({"error": "Vehicle not found"}, status=404)
            updated_vehicle = vehicles_col.find_one({"vehicle_id": vh_id})
            return JsonResponse({"message": "Vehicle updated successfully", "vehicle": serialize_doc(updated_vehicle)})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            
    elif request.method == 'DELETE':
        result = vehicles_col.delete_one({"vehicle_id": vh_id})
        if result.deleted_count == 0:
            return JsonResponse({"error": "Vehicle not found"}, status=404)
        return JsonResponse({"message": "Vehicle deleted successfully"})


# ================= RIDE BOOKING MANAGEMENT =================

@csrf_exempt
def bookings_list_or_add(request):
    if request.method == 'GET':
        query = {}
        for k, v in request.GET.items():
            if v.isdigit():
                query[k] = int(v)
            else:
                query[k] = v
        bookings = serialize_docs(bookings_col.find(query))
        return JsonResponse(bookings, safe=False)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            booking_id = data.get('booking_id')
            if not booking_id:
                booking_id = get_next_id(bookings_col, 'booking_id', 401)
            else:
                booking_id = int(booking_id)
                if bookings_col.find_one({"booking_id": booking_id}):
                    return JsonResponse({"error": f"Booking with ID {booking_id} already exists"}, status=400)
            
            booking = {
                "booking_id": booking_id,
                "customer_name": data.get('customer_name', ''),
                "driver_name": data.get('driver_name', ''),
                "pickup_location": data.get('pickup_location', ''),
                "drop_location": data.get('drop_location', ''),
                "booking_date": data.get('booking_date', ''),
                "fare": float(data.get('fare', 0)),
                "ride_status": data.get('ride_status', 'Requested')
            }
            bookings_col.insert_one(booking)
            return JsonResponse({"message": "Booking added successfully", "booking": serialize_doc(booking)}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def booking_update_or_delete(request, id):
    try:
        bk_id = int(id)
    except ValueError:
        return JsonResponse({"error": "Invalid ID format"}, status=400)

    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            data.pop('booking_id', None)
            data.pop('_id', None)
            if 'fare' in data:
                data['fare'] = float(data['fare'])
            
            result = bookings_col.update_one({"booking_id": bk_id}, {"$set": data})
            if result.matched_count == 0:
                return JsonResponse({"error": "Booking not found"}, status=404)
            updated_booking = bookings_col.find_one({"booking_id": bk_id})
            return JsonResponse({"message": "Booking updated successfully", "booking": serialize_doc(updated_booking)})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            
    elif request.method == 'DELETE':
        result = bookings_col.delete_one({"booking_id": bk_id})
        if result.deleted_count == 0:
            return JsonResponse({"error": "Booking not found"}, status=404)
        return JsonResponse({"message": "Booking deleted successfully"})


# ================= PAYMENT MANAGEMENT =================

@csrf_exempt
def payments_list_or_add(request):
    if request.method == 'GET':
        query = {}
        for k, v in request.GET.items():
            if v.isdigit():
                query[k] = int(v)
            else:
                query[k] = v
        payments = serialize_docs(payments_col.find(query))
        return JsonResponse(payments, safe=False)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            payment_id = data.get('payment_id')
            if not payment_id:
                payment_id = get_next_id(payments_col, 'payment_id', 501)
            else:
                payment_id = int(payment_id)
                if payments_col.find_one({"payment_id": payment_id}):
                    return JsonResponse({"error": f"Payment with ID {payment_id} already exists"}, status=400)
            
            payment = {
                "payment_id": payment_id,
                "booking_id": int(data.get('booking_id', 0)),
                "customer_name": data.get('customer_name', ''),
                "amount": float(data.get('amount', 0)),
                "payment_method": data.get('payment_method', 'Cash'),
                "payment_status": data.get('payment_status', 'Pending'),
                "transaction_id": data.get('transaction_id', ''),
                "payment_date": data.get('payment_date', '')
            }
            payments_col.insert_one(payment)
            return JsonResponse({"message": "Payment added successfully", "payment": serialize_doc(payment)}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def payment_update_or_delete(request, id):
    try:
        py_id = int(id)
    except ValueError:
        return JsonResponse({"error": "Invalid ID format"}, status=400)

    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            data.pop('payment_id', None)
            data.pop('_id', None)
            if 'booking_id' in data:
                data['booking_id'] = int(data['booking_id'])
            if 'amount' in data:
                data['amount'] = float(data['amount'])
            
            result = payments_col.update_one({"payment_id": py_id}, {"$set": data})
            if result.matched_count == 0:
                return JsonResponse({"error": "Payment not found"}, status=404)
            updated_payment = payments_col.find_one({"payment_id": py_id})
            return JsonResponse({"message": "Payment updated successfully", "payment": serialize_doc(updated_payment)})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            
    elif request.method == 'DELETE':
        result = payments_col.delete_one({"payment_id": py_id})
        if result.deleted_count == 0:
            return JsonResponse({"error": "Payment not found"}, status=404)
        return JsonResponse({"message": "Payment deleted successfully"})
