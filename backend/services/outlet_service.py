from typing import List
from api.db import supabase
from scraping.models import Outlet

class OutletService:
    def get_all_outlets(self) -> List[Outlet]:
        try:
            print("Fetching outlets from Supabase...")
            response = supabase.table("outlets").select("*").execute()
            print(f"Response received: {response}")
            
            if not response.data:
                print("No outlets found")
                return []
            
            outlets = [Outlet(**outlet) for outlet in response.data]
            print(f"Found {len(outlets)} outlets")
            return outlets
            
        except Exception as e:
            print(f"Error fetching outlets: {str(e)}")
            raise