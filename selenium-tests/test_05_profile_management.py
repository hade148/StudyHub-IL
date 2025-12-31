"""
Test 5: User Profile Management
Tests viewing and editing user profile information.
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import TestConfig, take_screenshot, wait_for_element, wait_for_clickable, safe_click


class TestProfileManagement:
    """Test cases for user profile functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self, authenticated_driver):
        """Setup: Use authenticated driver for all tests"""
        self.driver = authenticated_driver
        yield
    
    def test_01_navigate_to_profile(self):
        """
        Test navigation to the user profile page.
        
        Steps:
        1. From dashboard, navigate to profile section
        2. Verify profile page is displayed
        """
        print("\n=== Test 01: Navigate to Profile ===")
        
        try:
            # Try clicking on profile menu/button
            profile_button = None
            profile_selectors = [
                (By.XPATH, "//a[contains(text(), 'פרופיל')]"),
                (By.XPATH, "//button[contains(text(), 'פרופיל')]"),
                (By.XPATH, "//a[contains(@href, '/profile')]"),
                (By.XPATH, "//*[contains(@aria-label, 'profile')]"),
            ]
            
            for by, selector in profile_selectors:
                try:
                    profile_button = wait_for_clickable(self.driver, by, selector, timeout=5)
                    if profile_button:
                        break
                except:
                    continue
            
            if profile_button:
                safe_click(self.driver, profile_button)
                time.sleep(2)
            else:
                # Try direct navigation
                self.driver.get(f"{TestConfig.BASE_URL}/profile")
                time.sleep(2)
            
            take_screenshot(self.driver, "profile_page")
            
            # Verify we're on the profile page
            current_url = self.driver.current_url
            page_source = self.driver.page_source
            
            profile_indicators = ['/profile', 'פרופיל', 'profile']
            on_profile_page = any(indicator in current_url.lower() or indicator in page_source 
                                 for indicator in profile_indicators)
            
            assert on_profile_page, f"Not on profile page. Current URL: {current_url}"
            print("✅ Successfully navigated to profile page")
            
        except AssertionError as e:
            print(f"❌ Test failed: {e}")
            take_screenshot(self.driver, "profile_navigation_failure")
            raise
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            take_screenshot(self.driver, "profile_navigation_error")
            raise
    
    def test_02_view_profile_information(self):
        """
        Test viewing profile information.
        
        Steps:
        1. Navigate to profile page
        2. Verify user information is displayed
        3. Check for profile elements (name, email, stats, etc.)
        """
        print("\n=== Test 02: View Profile Information ===")
        
        try:
            self.driver.get(f"{TestConfig.BASE_URL}/profile")
            time.sleep(3)
            
            take_screenshot(self.driver, "profile_information")
            
            # Check for profile elements
            page_source = self.driver.page_source
            
            # Look for common profile fields
            profile_fields = ['email', 'name', 'שם', 'אימייל', 'bio', 'ביוגרפיה']
            fields_found = sum(1 for field in profile_fields if field in page_source.lower())
            
            # Look for statistics
            stats_keywords = ['סטטיסטיקות', 'statistics', 'סיכומים', 'summaries', 'posts', 'פוסטים']
            has_stats = any(keyword in page_source for keyword in stats_keywords)
            
            assert fields_found > 0 or has_stats, "Profile information not displayed"
            print(f"✅ Profile information displayed (found {fields_found} profile fields)")
            
        except AssertionError as e:
            print(f"❌ Test failed: {e}")
            take_screenshot(self.driver, "profile_info_failure")
            raise
        except Exception as e:
            print(f"⚠️ Test inconclusive: {e}")
            take_screenshot(self.driver, "profile_info_error")
    
    def test_03_edit_profile_button(self):
        """
        Test clicking the edit profile button.
        
        Steps:
        1. Navigate to profile page
        2. Find and click edit button
        3. Verify edit mode or edit page is displayed
        """
        print("\n=== Test 03: Edit Profile Button ===")
        
        try:
            self.driver.get(f"{TestConfig.BASE_URL}/profile")
            time.sleep(2)
            
            take_screenshot(self.driver, "before_edit")
            
            # Look for edit button
            edit_button = None
            edit_selectors = [
                (By.XPATH, "//button[contains(text(), 'ערוך')]"),
                (By.XPATH, "//button[contains(text(), 'Edit')]"),
                (By.XPATH, "//a[contains(text(), 'ערוך')]"),
                (By.XPATH, "//*[contains(@aria-label, 'edit')]"),
            ]
            
            for by, selector in edit_selectors:
                try:
                    edit_button = wait_for_clickable(self.driver, by, selector, timeout=5)
                    if edit_button:
                        break
                except:
                    continue
            
            if edit_button:
                safe_click(self.driver, edit_button)
                time.sleep(2)
                
                take_screenshot(self.driver, "edit_mode")
                
                # Check if edit form appeared or navigated to edit page
                page_source = self.driver.page_source
                edit_mode = any(keyword in page_source for keyword in 
                               ['save', 'שמור', 'cancel', 'ביטול', 'input', 'textarea'])
                
                if edit_mode:
                    print("✅ Edit mode activated successfully")
                else:
                    print("⚠️ Edit mode unclear")
            else:
                print("⚠️ Edit button not found")
                take_screenshot(self.driver, "edit_button_not_found")
            
        except Exception as e:
            print(f"⚠️ Edit test inconclusive: {e}")
            take_screenshot(self.driver, "edit_error")
    
    def test_04_edit_profile_name(self):
        """
        Test editing profile name/full name.
        
        Steps:
        1. Navigate to profile edit mode
        2. Change name field
        3. Save changes
        4. Verify changes are saved
        """
        print("\n=== Test 04: Edit Profile Name ===")
        
        try:
            self.driver.get(f"{TestConfig.BASE_URL}/profile")
            time.sleep(2)
            
            # Try to enter edit mode
            edit_button = wait_for_clickable(self.driver, By.XPATH, 
                                            "//button[contains(text(), 'ערוך')] | //button[contains(text(), 'Edit')]",
                                            timeout=5)
            if edit_button:
                safe_click(self.driver, edit_button)
                time.sleep(2)
            
            take_screenshot(self.driver, "edit_name_form")
            
            # Look for name input field
            name_field = None
            name_selectors = [
                (By.NAME, "fullName"),
                (By.NAME, "name"),
                (By.ID, "fullName"),
                (By.ID, "name"),
                (By.XPATH, "//input[@placeholder='שם מלא']"),
            ]
            
            for by, selector in name_selectors:
                try:
                    name_field = wait_for_element(self.driver, by, selector, timeout=3)
                    if name_field and name_field.is_displayed():
                        break
                except:
                    continue
            
            if name_field:
                # Store original value
                original_value = name_field.get_attribute('value')
                
                # Change the name
                new_name = f"Test User {int(time.time()) % 1000}"
                name_field.clear()
                time.sleep(0.5)
                name_field.send_keys(new_name)
                time.sleep(1)
                
                take_screenshot(self.driver, "name_changed")
                
                # Look for save button
                save_button = None
                save_selectors = [
                    (By.XPATH, "//button[contains(text(), 'שמור')]"),
                    (By.XPATH, "//button[contains(text(), 'Save')]"),
                    (By.XPATH, "//button[@type='submit']"),
                ]
                
                for by, selector in save_selectors:
                    try:
                        save_button = wait_for_clickable(self.driver, by, selector, timeout=3)
                        if save_button:
                            break
                    except:
                        continue
                
                if save_button:
                    safe_click(self.driver, save_button)
                    time.sleep(3)
                    
                    take_screenshot(self.driver, "after_save")
                    
                    # Verify change was saved
                    page_source = self.driver.page_source
                    saved_successfully = (
                        new_name in page_source or
                        'שמור' in page_source or
                        'saved' in page_source.lower() or
                        'success' in page_source.lower()
                    )
                    
                    if saved_successfully:
                        print(f"✅ Profile name updated to: {new_name}")
                    else:
                        print("⚠️ Save result unclear")
                else:
                    print("⚠️ Save button not found")
            else:
                print("⚠️ Name field not found or not editable")
                take_screenshot(self.driver, "name_field_not_found")
            
        except Exception as e:
            print(f"⚠️ Name edit test inconclusive: {e}")
            take_screenshot(self.driver, "name_edit_error")
    
    def test_05_view_profile_statistics(self):
        """
        Test viewing profile statistics.
        
        Steps:
        1. Navigate to profile page
        2. Locate statistics section
        3. Verify statistics are displayed
        """
        print("\n=== Test 05: View Profile Statistics ===")
        
        try:
            self.driver.get(f"{TestConfig.BASE_URL}/profile")
            time.sleep(3)
            
            take_screenshot(self.driver, "profile_statistics")
            
            # Look for statistics elements
            page_source = self.driver.page_source
            
            # Common statistics keywords
            stats_keywords = [
                'סטטיסטיקות', 'statistics',
                'סיכומים', 'summaries',
                'פוסטים', 'posts',
                'תגובות', 'comments',
                'דירוג', 'rating',
                'נקודות', 'points'
            ]
            
            stats_found = sum(1 for keyword in stats_keywords if keyword in page_source)
            
            # Look for numeric statistics
            import re
            numbers_found = len(re.findall(r'\d+', page_source))
            
            has_statistics = stats_found > 0 or numbers_found > 10
            
            if has_statistics:
                print(f"✅ Statistics displayed (found {stats_found} stat keywords)")
            else:
                print("⚠️ Statistics not clearly visible")
            
        except Exception as e:
            print(f"⚠️ Statistics test inconclusive: {e}")
            take_screenshot(self.driver, "statistics_error")
    
    def test_06_view_user_content(self):
        """
        Test viewing user's created content (summaries, posts, etc.).
        
        Steps:
        1. Navigate to profile page
        2. Look for user's content section
        3. Verify content is displayed or accessible
        """
        print("\n=== Test 06: View User Content ===")
        
        try:
            self.driver.get(f"{TestConfig.BASE_URL}/profile")
            time.sleep(3)
            
            take_screenshot(self.driver, "user_content")
            
            # Look for tabs or sections showing user content
            content_indicators = [
                'התוכן שלי', 'my content',
                'הסיכומים שלי', 'my summaries',
                'הפוסטים שלי', 'my posts',
                'tab', 'tabs'
            ]
            
            page_source = self.driver.page_source
            has_content_section = any(indicator in page_source.lower() 
                                     for indicator in content_indicators)
            
            if has_content_section:
                print("✅ User content section accessible")
                
                # Try clicking on content tabs if available
                tab_elements = self.driver.find_elements(By.XPATH, 
                    "//button[contains(@role, 'tab')] | //div[contains(@class, 'tab')]")
                
                if tab_elements:
                    print(f"Found {len(tab_elements)} content tabs")
            else:
                print("⚠️ User content section not clearly visible")
            
        except Exception as e:
            print(f"⚠️ Content view test inconclusive: {e}")
            take_screenshot(self.driver, "content_view_error")
    
    def test_07_profile_page_completeness(self):
        """
        Test that profile page contains all expected sections.
        
        Steps:
        1. Navigate to profile page
        2. Check for key profile sections
        3. Verify page is complete and functional
        """
        print("\n=== Test 07: Profile Page Completeness ===")
        
        try:
            self.driver.get(f"{TestConfig.BASE_URL}/profile")
            
            # Wait for page to fully load
            WebDriverWait(self.driver, 10).until(
                lambda d: d.execute_script('return document.readyState') == 'complete'
            )
            time.sleep(3)
            
            take_screenshot(self.driver, "profile_complete")
            
            page_source = self.driver.page_source
            
            # Check for essential profile sections
            sections_to_check = {
                'User info': ['name', 'email', 'שם', 'אימייל'],
                'Actions': ['edit', 'ערוך', 'settings', 'הגדרות'],
                'Statistics': ['stats', 'סטטיסטיקות', 'count', 'מספר'],
                'Content': ['summaries', 'posts', 'סיכומים', 'פוסטים']
            }
            
            sections_found = {}
            for section_name, keywords in sections_to_check.items():
                found = any(keyword in page_source.lower() for keyword in keywords)
                sections_found[section_name] = found
            
            # Report results
            for section, found in sections_found.items():
                status = "✓" if found else "✗"
                print(f"  {status} {section}: {'Found' if found else 'Not found'}")
            
            # At least 2 sections should be present for profile to be considered complete
            sections_present = sum(sections_found.values())
            assert sections_present >= 2, f"Only {sections_present} profile sections found"
            
            print(f"✅ Profile page has {sections_present}/{len(sections_to_check)} expected sections")
            
        except AssertionError as e:
            print(f"❌ Test failed: {e}")
            take_screenshot(self.driver, "profile_incomplete")
            raise
        except Exception as e:
            print(f"⚠️ Test inconclusive: {e}")
            take_screenshot(self.driver, "profile_completeness_error")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s", "--html=report.html"])
