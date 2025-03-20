from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup

from models import Outlet  # Changed to relative import

class SubwayScrapper:
    BASE_URL = "https://subway.com.my/find-a-subway"

    def __init__(self):
        self.driver = webdriver.Chrome()

    def scrape_kuala_lumpur(self)-> list[Outlet]:
        try:
            self.driver.maximize_window()
            self.driver.get(self.BASE_URL)

            wait = WebDriverWait(self.driver, 15)
            wait.until(EC.presence_of_element_located((By.ID, "fp_locationlist")))

            container = self.driver.find_element(By.ID, "fp_locationlist")
            html_snippet = container.get_attribute("outerHTML")
            soup = BeautifulSoup(html_snippet, "html.parser")

            items = soup.select("div.fp_listitem")
            outlets = []

            for item in items:
                lat_str = item.get("data-latitude",  "")
                lng_str = item.get("data-longitude", "")
                latitude = float(lat_str) if lat_str else 0.0
                longitude = float(lng_str) if lng_str else 0.0

                # Store name
                h4_el = item.select_one("h4")
                store_name = h4_el.get_text(strip=True) if h4_el else ""

                # Address and Hours from <p> tags
                p_tags = item.select(".infoboxcontent p")
                address = p_tags[0].get_text(strip=True) if p_tags else ""

                # Operating Hours
                hours_lines = []
                p_tags = item.select(".infoboxcontent p")
                for p_tag in p_tags[1:]:
                    text = p_tag.get_text(strip=True)
                    if any(day in text.lower() for day in ['monday', 'sunday', 'daily']):
                        hours_lines.append(text)
                operating_hours = " | ".join(filter(None, hours_lines))

                # Waze Link
                direction_link = item.select(".directionButton a")
                waze_link = direction_link[1]["href"] if len(direction_link) > 1 else ""

                # Filter for "Kuala Lumpur"
                if "Kuala Lumpur" in address:
                    outlet = Outlet(
                        name= store_name,
                        address=address,
                        operating_hours=operating_hours,
                        waze_link=waze_link,
                        latitude=latitude,
                        longitude=longitude
                    )
                    outlets.append(outlet)

            return outlets
            
        finally:
            self.driver.quit()

if __name__ == "__main__":
    scraper = SubwayScrapper()
    outlets = scraper.scrape_kuala_lumpur()
    
    print(f"\nFound {len(outlets)} outlets in Kuala Lumpur:")
    for outlet in outlets:
        print(f"\n- {outlet.name}")
        print(f"  Address: {outlet.address}")
        print(f"  Hours: {outlet.operating_hours}")
        print(f"  Coordinates: {outlet.latitude}, {outlet.longitude}")
        if outlet.waze_link:
            print(f"  Waze: {outlet.waze_link}")



