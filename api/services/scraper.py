import httpx
from bs4 import BeautifulSoup
import logging
import re
from typing import Dict, Any

logger = logging.getLogger(__name__)

class CourseScraperService:
    @staticmethod
    async def check_course_availability(crn: str, year: int, semester: str) -> Dict[str, Any]:
        """
        Scrape university course registration system to check if a course is available.
        
        This is a placeholder implementation. In a real system, you would need to:
        1. Customize this for your university's specific registration system
        2. Add appropriate error handling and rate limiting
        3. Consider implementing a cache to avoid hitting the registration system too frequently
        """
        try:
            # This URL should be changed to your university's course registration system
            base_url = "https://example-university.edu/courses"
            
            # Convert semester to the format expected by the university's system
            semester_code = {
                "Spring": "10",
                "Summer": "20",
                "Fall": "30"
            }.get(semester, "30")
            
            # Format the URL for the course search
            search_url = f"{base_url}/search?term={year}{semester_code}&crn={crn}"
            
            # Make HTTP request to the registration system
            async with httpx.AsyncClient() as client:
                response = await client.get(search_url, timeout=30.0)
                response.raise_for_status()
                
                # Parse the HTML response
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # This part needs to be customized for your university's HTML structure
                # Example: Look for a certain element that indicates if the course is open
                course_row = soup.find('tr', {'id': re.compile(f'.*{crn}.*')})
                
                if not course_row:
                    logger.warning(f"Course with CRN {crn} not found")
                    return {
                        "is_open": False,
                        "seats_available": 0,
                        "error": "Course not found"
                    }
                
                # Look for indicators of course availability
                # This is just an example - adjust to match your university's website
                status_cell = course_row.find('td', {'class': 'status'})
                seats_cell = course_row.find('td', {'class': 'seats'})
                
                is_open = False
                seats_available = 0
                
                if status_cell:
                    status_text = status_cell.text.strip().lower()
                    is_open = "open" in status_text
                
                if seats_cell:
                    try:
                        seats_available = int(seats_cell.text.strip())
                    except ValueError:
                        seats_available = 0
                
                return {
                    "is_open": is_open,
                    "seats_available": seats_available
                }
        
        except httpx.TimeoutException:
            logger.error(f"Timeout while checking course {crn}")
            return {"is_open": False, "error": "Request timeout"}
        
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error while checking course {crn}: {e}")
            return {"is_open": False, "error": f"HTTP error: {e.response.status_code}"}
            
        except Exception as e:
            logger.error(f"Error checking course {crn}: {e}")
            return {"is_open": False, "error": str(e)}

    @staticmethod
    async def simulate_course_availability(crn: str, year: int, semester: str) -> Dict[str, Any]:
        """
        Simulate course availability for testing without actually scraping.
        This is useful for development and testing.
        """
        import random
        
        # Simulate some randomness in availability
        is_open = random.random() > 0.7  # 30% chance of being open
        seats_available = 0
        
        if is_open:
            seats_available = random.randint(1, 10)
        
        return {
            "is_open": is_open,
            "seats_available": seats_available,
            "note": "This is simulated data for development purposes"
        } 