import os
import sys
from typing import List
from dotenv import load_dotenv

# Add the backend directory to Python path
backend_path = os.path.dirname(os.path.dirname(__file__))
if backend_path not in sys.path:
    sys.path.append(backend_path)

from api.db import supabase
from scraping.models import Outlet

class SupabaseService:
    def __init__(self):
        # Load environment variables from the root .env.local file
        env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env.local')
        load_dotenv(env_path)

    def insert_outlets(self, outlets: List[Outlet]) -> None:
        try:
            for outlet in outlets:
                row_data = {
                    "name": outlet.name,
                    "address": outlet.address,
                    "operating_hours": outlet.operating_hours,
                    "waze_link": outlet.waze_link,
                    "latitude": outlet.latitude,
                    "longitude": outlet.longitude
                }
                response = supabase.table("outlets").upsert(
                    row_data, 
                    on_conflict="name, address"
                ).execute()
                print(f"Inserted outlet: {outlet.name}")
        except Exception as e:
            print(f"Error inserting outlets: {str(e)}")
            raise