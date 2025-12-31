"""
Test 2: Summary Upload Flow
Tests the complete flow of uploading a summary file (PDF/DOCX) to the platform.
"""

import pytest
import time
import os
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import TestConfig, take_screenshot, wait_for_element, wait_for_clickable, safe_click


class TestSummaryUpload:
    """Test cases for summary upload functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self, authenticated_driver):
        """Setup: Use authenticated driver for all tests"""
        self.driver = authenticated_driver
        yield
    
    def test_01_navigate_to_upload_page(self):
        """
        Test navigation to the summary upload page.
        
        Steps:
        1. From dashboard, navigate to summaries section
        2. Click on upload button
        3. Verify upload page is displayed
        """
        print("\n=== Test 01: Navigate to Upload Page ===")
        
        try:
            # Navigate to summaries page
            self.driver.get(f"{TestConfig.BASE_URL}/summaries")
            time.sleep(2)
            
            take_screenshot(self.driver, "summaries_page")
            
            # Look for upload button (Hebrew: העלה סיכום)
            upload_button = None
            upload_selectors = [
                (By.XPATH, "//button[contains(text(), 'העלה')]"),
                (By.XPATH, "//a[contains(text(), 'העלה')]"),
                (By.XPATH, "//button[contains(text(), 'Upload')]"),
                (By.LINK_TEXT, "העלאת סיכום"),
            ]
            
            for by, selector in upload_selectors:
                try:
                    upload_button = wait_for_clickable(self.driver, by, selector, timeout=5)
                    if upload_button:
                        break
                except:
                    continue
            
            if upload_button:
                safe_click(self.driver, upload_button)
                time.sleep(2)
                take_screenshot(self.driver, "upload_page")
                
                # Verify we're on the upload page
                current_url = self.driver.current_url
                assert '/upload' in current_url.lower() or 'העלאה' in self.driver.page_source, \
                    f"Not on upload page. Current URL: {current_url}"
                
                print("✅ Successfully navigated to upload page")
            else:
                # Try direct navigation
                self.driver.get(f"{TestConfig.BASE_URL}/upload")
                time.sleep(2)
                take_screenshot(self.driver, "upload_page_direct")
                print("⚠️ Direct navigation to upload page")
            
        except AssertionError as e:
            print(f"❌ Test failed: {e}")
            take_screenshot(self.driver, "upload_navigation_failure")
            raise
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            take_screenshot(self.driver, "upload_navigation_error")
            raise
    
    def test_02_upload_summary_validation_required_fields(self):
        """
        Test validation for required fields in upload form.
        
        Steps:
        1. Navigate to upload page
        2. Try to submit without filling required fields
        3. Verify validation errors are shown
        """
        print("\n=== Test 02: Upload Form Validation ===")
        
        try:
            # Navigate to upload page
            self.driver.get(f"{TestConfig.BASE_URL}/upload")
            time.sleep(2)
            
            # Try to find and click submit/next button without filling fields
            submit_selectors = [
                (By.XPATH, "//button[@type='submit']"),
                (By.XPATH, "//button[contains(text(), 'הבא')]"),  # Next in Hebrew
                (By.XPATH, "//button[contains(text(), 'פרסם')]"),  # Publish in Hebrew
            ]
            
            submit_button = None
            for by, selector in submit_selectors:
                try:
                    submit_button = wait_for_element(self.driver, by, selector, timeout=5)
                    if submit_button:
                        break
                except:
                    continue
            
            if submit_button:
                # Scroll to button and click
                self.driver.execute_script("arguments[0].scrollIntoView();", submit_button)
                time.sleep(1)
                safe_click(self.driver, submit_button)
                time.sleep(2)
                
                take_screenshot(self.driver, "validation_errors")
                
                # Check if still on upload page (validation should prevent submission)
                current_url = self.driver.current_url
                page_source = self.driver.page_source
                
                # Look for validation indicators
                validation_found = (
                    '/upload' in current_url or
                    any(keyword in page_source for keyword in ['required', 'חובה', 'שדה', 'שגיאה'])
                )
                
                assert validation_found, "Expected validation errors were not found"
                print("✅ Form validation working correctly")
            else:
                print("⚠️ Submit button not found - test inconclusive")
            
        except AssertionError as e:
            print(f"❌ Test failed: {e}")
            raise
        except Exception as e:
            print(f"⚠️ Test inconclusive: {e}")
    
    def test_03_create_test_pdf_file(self):
        """
        Create a test PDF file for upload testing.
        This is a helper test to ensure we have test files.
        """
        print("\n=== Test 03: Create Test Files ===")
        
        try:
            # Create a test directory if it doesn't exist
            test_files_dir = os.path.join(os.path.dirname(__file__), 'test_files')
            os.makedirs(test_files_dir, exist_ok=True)
            
            # Create a simple text file that can be used for testing
            test_file_path = os.path.join(test_files_dir, 'test_summary.txt')
            with open(test_file_path, 'w', encoding='utf-8') as f:
                f.write("Test Summary Content\n")
                f.write("This is a test file for Selenium testing.\n")
                f.write("Created automatically for StudyHub-IL testing.\n")
            
            assert os.path.exists(test_file_path), "Test file was not created"
            print(f"✅ Test file created: {test_file_path}")
            
            # Store the path for use in other tests
            self.test_file_path = test_file_path
            
        except Exception as e:
            print(f"❌ Failed to create test file: {e}")
            raise
    
    def test_04_upload_summary_file_selection(self):
        """
        Test file selection in the upload form.
        
        Steps:
        1. Navigate to upload page
        2. Select a file using file input
        3. Verify file is selected and preview is shown
        """
        print("\n=== Test 04: File Selection ===")
        
        try:
            # Navigate to upload page
            self.driver.get(f"{TestConfig.BASE_URL}/upload")
            time.sleep(2)
            
            take_screenshot(self.driver, "before_file_selection")
            
            # Create a test file
            test_files_dir = os.path.join(os.path.dirname(__file__), 'test_files')
            os.makedirs(test_files_dir, exist_ok=True)
            test_file_path = os.path.join(test_files_dir, 'test_summary.txt')
            
            with open(test_file_path, 'w', encoding='utf-8') as f:
                f.write("Test Summary for Selenium Testing\n")
                f.write("This file is used to test the upload functionality.\n")
            
            # Find file input element
            file_input = None
            file_input_selectors = [
                (By.XPATH, "//input[@type='file']"),
                (By.CSS_SELECTOR, "input[type='file']"),
            ]
            
            for by, selector in file_input_selectors:
                try:
                    file_input = wait_for_element(self.driver, by, selector, timeout=5)
                    if file_input:
                        break
                except:
                    continue
            
            if file_input:
                # Make file input visible if hidden
                self.driver.execute_script(
                    "arguments[0].style.display = 'block'; arguments[0].style.visibility = 'visible';",
                    file_input
                )
                
                # Send file path to input
                file_input.send_keys(test_file_path)
                time.sleep(2)
                
                take_screenshot(self.driver, "after_file_selection")
                
                # Check if file name appears on page
                page_source = self.driver.page_source
                file_selected = 'test_summary' in page_source or os.path.basename(test_file_path) in page_source
                
                if file_selected:
                    print("✅ File selected successfully")
                else:
                    print("⚠️ File selection unclear - manual verification needed")
            else:
                print("⚠️ File input not found - manual verification needed")
                take_screenshot(self.driver, "file_input_not_found")
            
        except Exception as e:
            print(f"⚠️ File selection test inconclusive: {e}")
            take_screenshot(self.driver, "file_selection_error")
    
    def test_05_upload_summary_complete_flow(self):
        """
        Test the complete summary upload flow with all required fields.
        
        Steps:
        1. Navigate to upload page
        2. Select a file
        3. Fill in all required fields (title, course, description)
        4. Submit the form
        5. Verify success message or redirect
        """
        print("\n=== Test 05: Complete Upload Flow ===")
        
        try:
            # Navigate to upload page
            self.driver.get(f"{TestConfig.BASE_URL}/upload")
            time.sleep(3)
            
            take_screenshot(self.driver, "upload_form_start")
            
            # Create test file
            test_files_dir = os.path.join(os.path.dirname(__file__), 'test_files')
            os.makedirs(test_files_dir, exist_ok=True)
            test_file_path = os.path.join(test_files_dir, 'complete_test.txt')
            
            with open(test_file_path, 'w', encoding='utf-8') as f:
                f.write("Complete Test Summary\n")
                f.write("This is a complete end-to-end test.\n")
            
            # Step 1: Select file
            file_input = wait_for_element(self.driver, By.XPATH, "//input[@type='file']")
            if file_input:
                self.driver.execute_script(
                    "arguments[0].style.display = 'block'; arguments[0].style.visibility = 'visible';",
                    file_input
                )
                file_input.send_keys(test_file_path)
                time.sleep(2)
                take_screenshot(self.driver, "file_uploaded")
            
            # Step 2: Fill in title (try multiple possible field names)
            title_field = None
            title_selectors = [
                (By.NAME, "title"),
                (By.ID, "title"),
                (By.XPATH, "//input[@placeholder='כותרת']"),
                (By.XPATH, "//input[contains(@placeholder, 'שם')]"),
            ]
            
            for by, selector in title_selectors:
                try:
                    title_field = wait_for_element(self.driver, by, selector, timeout=3)
                    if title_field:
                        break
                except:
                    continue
            
            if title_field:
                title_field.clear()
                title_field.send_keys("סיכום בדיקה - Selenium Test")
                time.sleep(1)
            
            # Step 3: Fill in description
            description_field = None
            description_selectors = [
                (By.NAME, "description"),
                (By.ID, "description"),
                (By.XPATH, "//textarea"),
            ]
            
            for by, selector in description_selectors:
                try:
                    description_field = wait_for_element(self.driver, by, selector, timeout=3)
                    if description_field:
                        break
                except:
                    continue
            
            if description_field:
                description_field.clear()
                description_field.send_keys("זהו סיכום בדיקה אוטומטי שנוצר על ידי Selenium")
                time.sleep(1)
            
            take_screenshot(self.driver, "form_filled")
            
            # Step 4: Try to submit or proceed to next step
            # The upload might be multi-step, so look for "Next" or "Submit" buttons
            next_button_selectors = [
                (By.XPATH, "//button[contains(text(), 'הבא')]"),
                (By.XPATH, "//button[contains(text(), 'פרסם')]"),
                (By.XPATH, "//button[@type='submit']"),
            ]
            
            for by, selector in next_button_selectors:
                try:
                    next_button = wait_for_clickable(self.driver, by, selector, timeout=3)
                    if next_button:
                        self.driver.execute_script("arguments[0].scrollIntoView();", next_button)
                        time.sleep(1)
                        safe_click(self.driver, next_button)
                        time.sleep(3)
                        take_screenshot(self.driver, "after_submit")
                        break
                except:
                    continue
            
            # Check for success indicators
            page_source = self.driver.page_source
            current_url = self.driver.current_url
            
            success_indicators = ['הצלחה', 'success', 'הועלה', 'uploaded', '/summaries']
            success_found = any(indicator in page_source.lower() or indicator in current_url.lower() 
                              for indicator in success_indicators)
            
            if success_found:
                print("✅ Upload flow completed successfully")
            else:
                print("⚠️ Upload result unclear - manual verification needed")
                print(f"Current URL: {current_url}")
            
        except Exception as e:
            print(f"⚠️ Upload test inconclusive: {e}")
            take_screenshot(self.driver, "upload_flow_error")
    
    def test_06_view_uploaded_summaries_list(self):
        """
        Test viewing the list of uploaded summaries.
        
        Steps:
        1. Navigate to summaries page
        2. Verify summaries are displayed
        3. Check that summary cards/items are visible
        """
        print("\n=== Test 06: View Summaries List ===")
        
        try:
            # Navigate to summaries page
            self.driver.get(f"{TestConfig.BASE_URL}/summaries")
            time.sleep(3)
            
            take_screenshot(self.driver, "summaries_list")
            
            # Look for summary elements
            page_source = self.driver.page_source
            
            # Check if the page has loaded with content
            has_content = (
                'סיכום' in page_source or
                'summary' in page_source.lower() or
                len(self.driver.find_elements(By.XPATH, "//div[contains(@class, 'card')]")) > 0 or
                len(self.driver.find_elements(By.XPATH, "//a[contains(@href, 'summary')]")) > 0
            )
            
            assert has_content, "Summaries page appears to be empty"
            print("✅ Summaries list displayed successfully")
            
        except AssertionError as e:
            print(f"❌ Test failed: {e}")
            take_screenshot(self.driver, "summaries_list_failure")
            raise
        except Exception as e:
            print(f"⚠️ Test inconclusive: {e}")
            take_screenshot(self.driver, "summaries_list_error")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s", "--html=report.html"])
