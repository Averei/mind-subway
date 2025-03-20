from typing import List
from api.db import supabase
import re
from datetime import datetime

class ChatService:
    async def process_query(self, query: str) -> str:
        # Get outlets data from Supabase
        response = supabase.table('outlets').select("*").execute()
        outlets = response.data

        query = query.lower()
        
        if 'close' in query or 'latest' in query:
            return self._find_latest_closing(outlets)
        elif 'bangsar' in query:
            return self._find_in_location(outlets, 'Bangsar')
        
        return "I'm not sure about that. Try asking about closing times or specific locations."

    def _find_latest_closing(self, outlets) -> str:
        latest_time = "00:00"
        latest_outlets = []

        for outlet in outlets:
            # Extract closing time using regex
            matches = re.findall(r'(\d{1,2}:\d{2}\s*(?:AM|PM))', outlet['operating_hours'])
            if matches:
                closing_time = matches[-1]  # Last time mentioned is usually closing time
                if self._is_later_time(closing_time, latest_time):
                    latest_time = closing_time
                    latest_outlets = [outlet]
                elif closing_time == latest_time:
                    latest_outlets.append(outlet)

        if not latest_outlets:
            return "Could not determine the latest closing outlets."

        response = "Latest closing outlets:\n"
        for outlet in latest_outlets:
            response += f"• {outlet['name']}: {outlet['operating_hours']}\n"
        return response

    def _find_in_location(self, outlets, location: str) -> str:
        location_outlets = [
            outlet for outlet in outlets 
            if location.lower() in outlet['address'].lower()
        ]

        if not location_outlets:
            return f"No outlets found in {location}."

        response = f"Found {len(location_outlets)} outlet(s) in {location}:\n"
        for outlet in location_outlets:
            response += f"• {outlet['name']}: {outlet['address']}\n"
        return response

    def _is_later_time(self, time1: str, time2: str) -> bool:
        try:
            t1 = datetime.strptime(time1.strip(), "%I:%M %p")
            t2 = datetime.strptime(time2.strip(), "%I:%M %p")
            return t1 > t2
        except:
            return False