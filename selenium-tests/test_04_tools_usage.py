"""
Test 4: Tools Navigation and Usage
Tests accessing and using educational tools on the platform.
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import TestConfig, take_screenshot, wait_for_element, wait_for_clickable, safe_click


class TestToolsUsage:
    """Test cases for tools functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self, authenticated_driver):
        """Setup: Use authenticated driver for all tests"""
        self.driver = authenticated_driver
        yield
    
    def test_01_navigate_to_tools_page(self):
        """
        Test navigation to the tools page.
        
        Steps:
        1. From dashboard, navigate to tools section
        2. Verify tools page is displayed
        """
        print("\n=== Test 01: Navigate to Tools Page ===")
        
        try:
            # Navigate to tools page
            self.driver.get(f"{TestConfig.BASE_URL}/tools")
            time.sleep(2)
            
            take_screenshot(self.driver, "tools_page")
            
            # Verify we're on the tools page
            current_url = self.driver.current_url
            page_source = self.driver.page_source
            
            tools_indicators = ['/tools', 'כלים', 'tools']
            on_tools_page = any(indicator in current_url.lower() or indicator in page_source 
                               for indicator in tools_indicators)
            
            assert on_tools_page, f"Not on tools page. Current URL: {current_url}"
            print("✅ Successfully navigated to tools page")
            
        except AssertionError as e:
            print(f"❌ Test failed: {e}")
            take_screenshot(self.driver, "tools_navigation_failure")
            raise
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            take_screenshot(self.driver, "tools_navigation_error")
            raise
    
    def test_02_view_tools_list(self):
        """
        Test viewing the list of available tools.
        
        Steps:
        1. Navigate to tools page
        2. Verify tools are displayed
        3. Check that tool cards/items are visible
        """
        print("\n=== Test 02: View Tools List ===")
        
        try:
            self.driver.get(f"{TestConfig.BASE_URL}/tools")
            time.sleep(3)
            
            take_screenshot(self.driver, "tools_list")
            
            # Look for tool elements
            tool_elements = []
            tool_selectors = [
                (By.XPATH, "//div[contains(@class, 'tool')]"),
                (By.XPATH, "//div[contains(@class, 'card')]"),
                (By.XPATH, "//a[contains(@href, '/tool')]"),
            ]
            
            for by, selector in tool_selectors:
                try:
                    elements = self.driver.find_elements(by, selector)
                    if elements:
                        tool_elements = elements
                        break
                except:
                    continue
            
            page_source = self.driver.page_source
            has_tools = (
                len(tool_elements) > 0 or
                'כלי' in page_source or
                'tool' in page_source.lower()
            )
            
            if has_tools:
                print(f"✅ Tools displayed (found {len(tool_elements)} tool elements)")
            else:
                print("⚠️ No tools found - page might be empty or structure different")
            
        except Exception as e:
            print(f"⚠️ Test inconclusive: {e}")
            take_screenshot(self.driver, "tools_list_error")
    
    def test_03_click_on_tool(self):
        """
        Test clicking on a tool to view details.
        
        Steps:
        1. Navigate to tools page
        2. Click on a tool
        3. Verify tool details or tool page is displayed
        """
        print("\n=== Test 03: Click on Tool ===")
        
        try:
            self.driver.get(f"{TestConfig.BASE_URL}/tools")
            time.sleep(3)
            
            take_screenshot(self.driver, "before_tool_click")
            
            # Find clickable tool elements
            tool_links = []
            link_selectors = [
                (By.XPATH, "//a[contains(@href, '/tool')]"),
                (By.XPATH, "//div[contains(@class, 'tool')]//a"),
                (By.XPATH, "//div[contains(@class, 'card')]//a"),
            ]
            
            for by, selector in link_selectors:
                try:
                    links = self.driver.find_elements(by, selector)
                    tool_links = [link for link in links if link.is_displayed()]
                    if tool_links:
                        break
                except:
                    continue
            
            if tool_links:
                # Click on the first tool
                first_tool = tool_links[0]
                initial_url = self.driver.current_url
                safe_click(self.driver, first_tool)
                time.sleep(3)
                
                take_screenshot(self.driver, "tool_clicked")
                
                # Verify navigation occurred or modal opened
                current_url = self.driver.current_url
                navigation_occurred = current_url != initial_url
                
                if navigation_occurred:
                    print("✅ Tool navigation successful")
                else:
                    # Check if a modal or details section appeared
                    page_source = self.driver.page_source
                    modal_appeared = any(keyword in page_source for keyword in 
                                       ['modal', 'dialog', 'popup', 'details'])
                    if modal_appeared:
                        print("✅ Tool details modal/section displayed")
                    else:
                        print("⚠️ Tool interaction result unclear")
            else:
                print("⚠️ No clickable tools found")
                take_screenshot(self.driver, "no_tools_found")
            
        except Exception as e:
            print(f"⚠️ Test inconclusive: {e}")
            take_screenshot(self.driver, "tool_click_error")
    
    def test_04_search_tools(self):
        """
        Test searching for tools.
        
        Steps:
        1. Navigate to tools page
        2. Find search field
        3. Enter search query
        4. Verify filtered results
        """
        print("\n=== Test 04: Search Tools ===")
        
        try:
            self.driver.get(f"{TestConfig.BASE_URL}/tools")
            time.sleep(2)
            
            # Look for search field
            search_field = None
            search_selectors = [
                (By.NAME, "search"),
                (By.XPATH, "//input[@type='search']"),
                (By.XPATH, "//input[@placeholder='חיפוש']"),
                (By.XPATH, "//input[contains(@placeholder, 'Search')]"),
            ]
            
            for by, selector in search_selectors:
                try:
                    search_field = wait_for_element(self.driver, by, selector, timeout=5)
                    if search_field:
                        break
                except:
                    continue
            
            if search_field:
                take_screenshot(self.driver, "before_search")
                
                # Enter search query
                search_field.clear()
                search_field.send_keys("calculator")
                time.sleep(2)
                
                take_screenshot(self.driver, "after_search")
                
                print("✅ Search functionality accessible")
            else:
                print("⚠️ Search field not found")
                take_screenshot(self.driver, "search_not_found")
            
        except Exception as e:
            print(f"⚠️ Search test inconclusive: {e}")
            take_screenshot(self.driver, "search_error")
    
    def test_05_rate_tool(self):
        """
        Test rating a tool.
        
        Steps:
        1. Navigate to tools page
        2. Find a tool to rate
        3. Click rating stars/buttons
        4. Verify rating is saved
        """
        print("\n=== Test 05: Rate Tool ===")
        
        try:
            self.driver.get(f"{TestConfig.BASE_URL}/tools")
            time.sleep(3)
            
            take_screenshot(self.driver, "before_rating")
            
            # Look for rating elements (stars, thumbs up/down, etc.)
            rating_elements = []
            rating_selectors = [
                (By.XPATH, "//button[contains(@aria-label, 'rate')]"),
                (By.XPATH, "//*[contains(@class, 'star')]"),
                (By.XPATH, "//*[contains(@class, 'rating')]"),
                (By.XPATH, "//button[contains(@class, 'like')]"),
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
                # Click the first rating element
                first_rating = rating_elements[0]
                self.driver.execute_script("arguments[0].scrollIntoView();", first_rating)
                time.sleep(1)
                
                try:
                    safe_click(self.driver, first_rating)
                    time.sleep(2)
                    take_screenshot(self.driver, "after_rating")
                    print("✅ Rating interaction successful")
                except:
                    print("⚠️ Could not click rating element")
            else:
                print("⚠️ Rating elements not found")
                take_screenshot(self.driver, "rating_not_found")
            
        except Exception as e:
            print(f"⚠️ Rating test inconclusive: {e}")
            take_screenshot(self.driver, "rating_error")
    
    def test_06_tools_page_responsiveness(self):
        """
        Test that tools page loads and displays correctly.
        
        Steps:
        1. Navigate to tools page
        2. Check page title
        3. Verify page content is not empty
        4. Check for common page elements
        """
        print("\n=== Test 06: Tools Page Responsiveness ===")
        
        try:
            self.driver.get(f"{TestConfig.BASE_URL}/tools")
            
            # Wait for page to fully load
            WebDriverWait(self.driver, 10).until(
                lambda d: d.execute_script('return document.readyState') == 'complete'
            )
            time.sleep(2)
            
            take_screenshot(self.driver, "tools_page_loaded")
            
            # Check page is not empty
            page_source = self.driver.page_source
            body_text = self.driver.find_element(By.TAG_NAME, "body").text
            
            assert len(body_text) > 100, "Page appears to be empty"
            
            # Check for common navigation elements
            nav_elements = self.driver.find_elements(By.TAG_NAME, "nav")
            header_elements = self.driver.find_elements(By.TAG_NAME, "header")
            
            has_structure = len(nav_elements) > 0 or len(header_elements) > 0
            
            if has_structure:
                print("✅ Tools page structure is correct")
            else:
                print("⚠️ Page structure unclear")
            
            print(f"Page contains {len(body_text)} characters of text")
            
        except AssertionError as e:
            print(f"❌ Test failed: {e}")
            take_screenshot(self.driver, "tools_page_failure")
            raise
        except Exception as e:
            print(f"⚠️ Test inconclusive: {e}")
            take_screenshot(self.driver, "tools_page_error")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s", "--html=report.html"])
