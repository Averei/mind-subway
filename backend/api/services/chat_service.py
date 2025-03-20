from typing import List
import os
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
from api.db import supabase
import requests
import re
from datetime import datetime

load_dotenv('.env.local')

class ChatService:
    def __init__(self):
        self.client = InferenceClient(token=os.getenv('HUGGINGFACE_API_KEY'))
        self.model = "mistralai/Mixtral-8x7B-Instruct-v0.1"
        self.closing_time_patterns = [
            r'(\d{1,2}:\d{2}\s*(?:AM|PM))',
            r'(\d{1,2}(?:AM|PM))'
        ]
        self.greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']

    async def process_query(self, query: str) -> str:
        try:
            # Get outlets data from Supabase
            response = supabase.table('outlets').select("*").execute()
            outlets = response.data

            # Format outlet data for context
            outlets_info = "\n".join([
                f"• {outlet['name']}: Located at {outlet['address']}, Operating hours: {outlet['operating_hours']}"
                for outlet in outlets
            ])

            # Create the prompt
            prompt = f"""You are a helpful assistant for Subway restaurants in Kuala Lumpur.
            Use this context to answer questions:

            {outlets_info}

            Question: {query}

            Answer:"""

            # Get response from HuggingFace
            completion = self.client.text_generation(
                prompt,
                max_new_tokens=150,
                temperature=0.7,
                top_p=0.95,
                return_full_text=False  # Only return the generated text
            )

            # Handle general queries
            if query.lower() in ['hello', 'hi', 'hey']:
                return f"Hello! I can help you find information about {len(outlets)} Subway outlets in KL. Feel free to ask about locations, opening hours, or specific areas!"

            # Process the completion
            if completion:
                return completion

            return "I'm not sure about that. Try asking about specific outlets, locations, or operating hours."

        except Exception as e:
            print(f"Error processing query: {str(e)}")
            return "I apologize, but I'm having trouble accessing the outlet information right now. Please try again in a moment."

    def _find_latest_closing(self, outlets) -> str:
        latest_time = datetime.strptime("00:00 AM", "%I:%M %p")
        latest_outlets = []

        for outlet in outlets:
            for pattern in self.closing_time_patterns:
                matches = re.findall(pattern, outlet['operating_hours'])
                if matches:
                    closing_time = matches[-1]
                    try:
                        time = datetime.strptime(closing_time, "%I:%M %p")
                        if time > latest_time:
                            latest_time = time
                            latest_outlets = [outlet]
                        elif time == latest_time:
                            latest_outlets.append(outlet)
                    except ValueError:
                        continue

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