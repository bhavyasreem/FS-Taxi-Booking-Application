# GoTaxi - Taxi Booking Application

A full-stack ride-hailing and taxi-booking platform built with a Django REST API backend, MongoDB Atlas (via PyMongo), and a modern dark/neon glassmorphic frontend interface.

## Technology Stack

- **Frontend**: HTML5, CSS3 (Vanilla Custom Layout), JavaScript (ES6 Fetch API)
- **Backend**: Django (Function-Based REST views), PyMongo, `python-dotenv`, `django-cors-headers`
- **Database**: MongoDB Atlas Cluster

---

## Folder Structure

```text
TaxiBookingApplication/
│
├── Backend/
│     .env              # Secure database connection credentials
│     db.py             # PyMongo database connection configurations
│     views.py          # 20 Function-Based REST API Views + Login handler
│     urls.py           # API Route Mappings
│     settings.py       # Django project configuration settings
│     wsgi.py & asgi.py # Deployment handlers
│
├── Frontend/
│     index.html        # Home Page (Hero, Popular Destinations, Offers)
│     login.html        # Unified login screen (Customer, Driver, Admin)
│     register.html     # Registration console (Dynamic Customer/Driver input)
│     booking.html      # Ride request & instant fare calculator
│     drivers.html      # Drivers directory & vehicle association status
│     payments.html     # Secure transaction checkout screen
│     ride_history.html # Customer travel logs & status badges
│     customer_dashboard.html # Passenger ride metrics & recent payments
│     driver_dashboard.html   # Driver partner trip management and availability toggles
│     admin_dashboard.html    # Administrative control center for CRUD operations
│     style.css         # Styling sheet (Glassmorphic variables, dark/neon theme)
│     script.js         # Frontend controllers, state synchronization, & Fetch API bindings
│
├── manage.py           # Django management utility script
├── requirements.txt    # Python library dependencies list
├── seed_db.py          # Database seeding script for sample testing data
└── README.md           # Documentation manual
```

---

## Setup & Execution Instructions

### Prerequisites
- Python 3.10 or higher
- Pip (Python Package Manager)

### Step 1: Install Dependencies
1. Clone or extract the project workspace files.
2. Initialize and activate a Python virtual environment:
   ```powershell
   # Windows PowerShell
   python -m venv .venv
   .venv\Scripts\activate
   ```
3. Install package requirements:
   ```bash
   pip install -r requirements.txt
   ```

### Step 2: Configure Environment Variables
Inside [Backend/.env](file:///c:/Users/USER/OneDrive/Desktop/Documents/Taxi%20Booking%20Application/Backend/.env), define your MongoDB connection URI (already configured):
```env
MONGO_URI=your url...
```

### Step 3: Seed Sample Testing Data
Populate the MongoDB collection with the required test datasets (Rahul Sharma, Ramesh Kumar, Sedan vehicle association, etc.):
```bash
python seed_db.py
```

### Step 4: Run Django REST Server
Start the Django development server locally on port 8000:
```bash
python manage.py runserver
```
The backend API will run on: `http://127.0.0.1:8000/`

### Step 5: Open Frontend
Double click or open [Frontend/index.html](file:///c:/Users/USER/OneDrive/Desktop/Documents/Taxi%20Booking%20Application/Frontend/index.html) in any modern browser to run the application.

---

## API Documentation (20 REST Endpoints)

### 1. Customer Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/customers/add/` | Add a new customer account |
| **GET** | `/customers/` | List all customers or filter by query parameters |
| **PUT** | `/customers/update/<id>/` | Update an existing customer's profile by ID |
| **DELETE**| `/customers/delete/<id>/` | Delete a customer from the database by ID |

### 2. Driver Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/drivers/add/` | Add a new driver partner |
| **GET** | `/drivers/` | List all drivers or filter by query parameters |
| **PUT** | `/drivers/update/<id>/` | Update driver availability or stats by ID |
| **DELETE**| `/drivers/delete/<id>/` | Delete a driver from the platform by ID |

### 3. Vehicle Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/vehicles/add/` | Register a new vehicle details |
| **GET** | `/vehicles/` | List all vehicles or filter by query parameters |
| **PUT** | `/vehicles/update/<id>/` | Edit vehicle registration or category by ID |
| **DELETE**| `/vehicles/delete/<id>/` | Delete a vehicle record by ID |

### 4. Ride Booking Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/bookings/add/` | Request a new taxi booking |
| **GET** | `/bookings/` | List all bookings or filter by query parameters |
| **PUT** | `/bookings/update/<id>/` | Update trip status (Accepted, In Progress, Completed) |
| **DELETE**| `/bookings/delete/<id>/` | Delete a booking transaction by ID |

### 5. Payment Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/payments/add/` | Add a new payment transaction log |
| **GET** | `/payments/` | List all payments or filter by query parameters |
| **PUT** | `/payments/update/<id>/` | Edit payment status by ID |
| **DELETE**| `/payments/delete/<id>/` | Remove a payment transaction record by ID |

### 6. Authentication Helper
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/login/` | Universal credentials validator for Customer, Driver, and Admin |

---

## Testing & Authentication Credentials

### 1. Customers
- **Email**: `rahul@gmail.com`
- **Password**: `rahul123`

### 2. Drivers
- **Email**: `ramesh@gmail.com`
- **Password (Phone)**: `9988776655` (or default `driver123`)

### 3. Administrators
- **Email**: `admin@taxi.com`
- **Password**: `admin123`
