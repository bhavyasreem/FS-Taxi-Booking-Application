import os
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / 'Backend' / '.env')

mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    mongo_uri = "mongodb+srv://Doremon_12:RRobertR%408908@cluster0.zx7ka0h.mongodb.net/"

client = MongoClient(mongo_uri)
db = client['taxi_booking_db']

# Collections
customers_col = db['customers']
drivers_col = db['drivers']
vehicles_col = db['vehicles']
bookings_col = db['bookings']
payments_col = db['payments']
