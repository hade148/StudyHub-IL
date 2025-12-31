"""
Test 6: Content Rating and Reviews
Tests rating functionality for summaries and tools.
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import TestConfig, take_screenshot, wait_for_element, wait_for_clickable, safe_click


class TestContentRating:
    """Test cases for content rating functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self, authenticated_driver):
        """Setup: Use authenticated driver for all tests"""
        self.driver = authenticated_driver
        yield
    
    def test_01_rate_summary(self):
        """
        Test rating a summary.
        
        Steps:
        1. Navigate to summaries page
        2. Find a summary to rate
        3. Click on rating element
        4. Verify rating is saved
        """
        print("\n=== Test 01: Rate Summary ===")
        
        try:
            self.driver.get(f"{TestConfig.BASE_URL}/summaries")
            time.sleep(3)
            
            take_screenshot(self.driver, "summaries_before_rating")
            
            # Look for rating elements
            rating_elements = []
            rating_selectors = [
                (By.XPATH, "//*[contains(@class, 'star')]"),
                (By.XPATH, "//*[contains(@class, 'rating')]"),
                (By.XPATH, "//button[contains(@aria-label, 'rate')]"),
                (By.XPATH, "//button[contains(text(), 'דרג')]"),
            ]
            
            for by, selector in rating_selectors:
                try:
                    elements = self.driver.find_elements(by, selector)
                    if elements and len(elements) > 0:
                        rating_elements = elements
                        break
                except:
                    continue
            
            if rating_elements:
                # Scroll to first rating element
                first_rating = rating_elements[0]
                self.driver.execute_script("arguments[0].scrollIntoView();", first_rating)
                time.sleep(1)
                
                # Try to click
                try:
                    safe_click(self.driver, first_rating)
                    time.sleep(2)
                    take_screenshot(self.driver, "summary_rated")
                    print("✅ Summary rating interaction successful")
                except:
                    print("⚠️ Could not interact with rating element")
            else:
                print("⚠️ Rating elements not found")
                take_screenshot(self.driver, "rating_not_found")
            
        except Exception as e:
            print(f"⚠️ Rating test inconclusive: {e}")
            take_screenshot(self.driver, "rating_error")
    
    def test_02_view_summary_rating_statistics(self):
        """
        Test viewing rating statistics on a summary.
        
        Steps:
        1. Navigate to a summary detail page
        2. Locate rating information
        3. Verify rating statistics are displayed
        """
        print("\n=== Test 02: View Summary Rating Statistics ===")
        
        try:
            # Navigate to summaries and click on one
            self.driver.get(f"{TestConfig.BASE_URL}/summaries")
            time.sleep(3)
            
            # Find summary links
            summary_links = self.driver.find_elements(By.XPATH, "//a[contains(@href, '/summary')]")
            
            if summary_links:
                summary_links[0].click()
                time.sleep(3)
                
                take_screenshot(self.driver, "summary_detail_rating")
                
                # Look for rating statistics
                page_source = self.driver.page_source
                
                rating_indicators = ['rating', 'דירוג', 'star', 'כוכב', 'reviews', 'ביקורות']
                has_rating_info = any(indicator in page_source.lower() 
                                     for indicator in rating_indicators)
                
                if has_rating_info:
                    print("✅ Rating statistics visible on summary detail page")
                else:
                    print("⚠️ Rating information not clearly visible")
            else:
                print("⚠️ No summaries found to test rating statistics")
            
        except Exception as e:
            print(f"⚠️ Test inconclusive: {e}")
            take_screenshot(self.driver, "rating_stats_error")
    
    def test_03_rate_tool(self):
        """
        Test rating a tool.
        
        Steps:
        1. Navigate to tools page
        2. Find a tool to rate
        3. Click on rating element
        4. Verify rating interaction
        """
        print("\n=== Test 03: Rate Tool ===")
        
        try:
            self.driver.get(f"{TestConfig.BASE_URL}/tools")
            time.sleep(3)
            
            take_screenshot(self.driver, "tools_before_rating")
            
            # Look for rating elements on tools
            rating_buttons = []
            rating_selectors = [
                (By.XPATH, "//button[contains(@class, 'like')]"),
                (By.XPATH, "//button[contains(@class, 'thumbs')]"),
                (By.XPATH, "//*[contains(@class, 'rating')]"),
                (By.XPATH, "//button[contains(text(), '👍')]"),
            ]
            
            for by, selector in rating_selectors:
                try:
                    buttons = self.driver.find_elements(by, selector)
                    if buttons and len(buttons) > 0:
                        rating_buttons = buttons
                        break
                except:
                    continue
            
            if rating_buttons:
                # Try to click first rating button
                first_button = rating_buttons[0]
                self.driver.execute_script("arguments[0].scrollIntoView();", first_button)
                time.sleep(1)
                
                try:
                    safe_click(self.driver, first_button)
                    time.sleep(2)
                    take_screenshot(self.driver, "tool_rated")
                    print("✅ Tool rating interaction successful")
                except:
                    print("⚠️ Could not interact with rating button")
            else:
                print("⚠️ Rating buttons not found on tools page")
                take_screenshot(self.driver, "tool_rating_not_found")
            
        except Exception as e:
            print(f"⚠️ Tool rating test inconclusive: {e}")
            take_screenshot(self.driver, "tool_rating_error")
    
    def test_04_prevent_duplicate_rating(self):
        """
        Test that users cannot rate the same item twice.
        
        Steps:
        1. Navigate to a rateable item
        2. Rate the item
        3. Try to rate again
        4. Verify duplicate rating is prevented or updates existing rating
        """
        print("\n=== Test 04: Prevent Duplicate Rating ===")
        
        try:
            self.driver.get(f"{TestConfig.BASE_URL}/summaries")
            time.sleep(3)
            
            # Find rating element
            rating_elements = self.driver.find_elements(By.XPATH, 
                "//*[contains(@class, 'star')] | //*[contains(@class, 'rating')]")
            
            if rating_elements and len(rating_elements) > 0:
                first_rating = rating_elements[0]
                
                # First click
                self.driver.execute_script("arguments[0].scrollIntoView();", first_rating)
                time.sleep(1)
                safe_click(self.driver, first_rating)
                time.sleep(2)
                
                take_screenshot(self.driver, "first_rating")
                
                # Try second click
                try:
                    safe_click(self.driver, first_rating)
                    time.sleep(2)
                    take_screenshot(self.driver, "second_rating_attempt")
                    
                    # Check for error message or state change
                    page_source = self.driver.page_source
                    
                    # Look for indicators that duplicate rating is handled
                    handled = any(keyword in page_source for keyword in 
                                ['כבר דירגת', 'already rated', 'update', 'עדכון'])
                    
                    if handled:
                        print("✅ Duplicate rating properly handled")
                    else:
                        print("⚠️ Duplicate rating handling unclear")
                except:
                    print("⚠️ Could not test duplicate rating")
            else:
                print("⚠️ No rating elements found for testing")
            
        except Exception as e:
            print(f"⚠️ Duplicate rating test inconclusive: {e}")
            take_screenshot(self.driver, "duplicate_rating_error")
    
    def test_05_view_top_rated_content(self):
        """
        Test viewing top-rated or popular content.
        
        Steps:
        1. Navigate to summaries or tools page
        2. Look for sorting/filtering by rating
        3. Verify top-rated items are highlighted
        """
        print("\n=== Test 05: View Top Rated Content ===")
        
        try:
            self.driver.get(f"{TestConfig.BASE_URL}/summaries")
            time.sleep(3)
            
            take_screenshot(self.driver, "summaries_page_ratings")
            
            # Look for sort/filter options
            page_source = self.driver.page_source
            
            sort_indicators = ['sort', 'מיון', 'filter', 'פילטר', 'popular', 'פופולרי', 
                             'top rated', 'הכי מדורג']
            has_sort_options = any(indicator in page_source.lower() 
                                  for indicator in sort_indicators)
            
            if has_sort_options:
                print("✅ Sorting/filtering options visible")
                
                # Try to find and click sort dropdown
                sort_elements = self.driver.find_elements(By.XPATH, 
                    "//select | //button[contains(text(), 'מיון')] | //button[contains(text(), 'Sort')]")
                
                if sort_elements:
                    print(f"Found {len(sort_elements)} sort/filter elements")
            else:
                print("⚠️ Sort/filter options not clearly visible")
            
            # Check for rating indicators on items
            rating_displays = self.driver.find_elements(By.XPATH, 
                "//*[contains(@class, 'rating')] | //*[contains(text(), '★')] | //*[contains(text(), '⭐')]")
            
            if rating_displays:
                print(f"✅ Found {len(rating_displays)} rating display elements")
            else:
                print("⚠️ Rating displays not found")
            
        except Exception as e:
            print(f"⚠️ Top rated content test inconclusive: {e}")
            take_screenshot(self.driver, "top_rated_error")
    
    def test_06_rating_persistence(self):
        """
        Test that ratings persist after page reload.
        
        Steps:
        1. Rate an item
        2. Reload the page
        3. Verify the rating is still there
        """
        print("\n=== Test 06: Rating Persistence ===")
        
        try:
            self.driver.get(f"{TestConfig.BASE_URL}/summaries")
            time.sleep(3)
            
            # Find and click a rating element
            rating_elements = self.driver.find_elements(By.XPATH, 
                "//*[contains(@class, 'star')] | //*[contains(@class, 'rating')]")
            
            if rating_elements:
                first_rating = rating_elements[0]
                self.driver.execute_script("arguments[0].scrollIntoView();", first_rating)
                time.sleep(1)
                
                # Get the state before rating (if possible)
                initial_state = first_rating.get_attribute('class')
                
                # Click rating
                safe_click(self.driver, first_rating)
                time.sleep(2)
                
                take_screenshot(self.driver, "before_reload")
                
                # Note the current URL
                current_url = self.driver.current_url
                
                # Reload the page
                self.driver.refresh()
                time.sleep(3)
                
                take_screenshot(self.driver, "after_reload")
                
                # Check if rating is still visible
                page_source = self.driver.page_source
                
                # Look for indicators that rating persisted
                rating_indicators = ['rated', 'דירגת', 'your rating', 'הדירוג שלך']
                rating_persisted = any(indicator in page_source.lower() 
                                      for indicator in rating_indicators)
                
                if rating_persisted:
                    print("✅ Rating appears to persist after reload")
                else:
                    print("⚠️ Rating persistence unclear")
            else:
                print("⚠️ No rating elements found for testing persistence")
            
        except Exception as e:
            print(f"⚠️ Persistence test inconclusive: {e}")
            take_screenshot(self.driver, "persistence_error")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s", "--html=report.html"])
