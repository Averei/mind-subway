from dotenv import load_dotenv
import os
from supabase import create_client, Client

# Get the absolute path to the .env.local file
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env.local')

load_dotenv(env_path)

# Get and validate environment variables
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(supabase_url, supabase_key)

def get_all_outlets():
    try:
        response = supabase.table('outlets').select("*").execute()
        return response.data
    except Exception as e:
        print(f"Error fetching outlets: {e}")
        return []

if __name__ == "__main__":
    outlets = get_all_outlets()
    print("Outlets data:", outlets)
