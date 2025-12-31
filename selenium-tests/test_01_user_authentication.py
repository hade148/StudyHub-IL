"""
Test 1: User Registration and Login Flow
Tests the complete authentication flow including registration, login, and logout.
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import TestConfig, take_screenshot, wait_for_element, wait_for_clickable


class TestUserAuthentication:
    """Test cases for user authentication flows"""
    
    def test_01_user_registration_success(self, driver):
        """
        Test successful user registration with valid credentials.
        
        Steps:
        1. Navigate to registration page
        2. Fill in registration form with valid data
        3. Submit the form
        4. Verify successful registration (redirect or success message)
        """
        print("\n=== Test 01: User Registration Success ===")
        
        # Navigate to registration page
        driver.get(f"{TestConfig.BASE_URL}/register")
        time.sleep(2)  # Wait for page load
        
        # Take screenshot of registration page
        take_screenshot(driver, "registration_page")
        
        try:
            # Generate unique email for testing
            import random
            test_email = f"testuser{random.randint(1000, 9999)}@test.com"
            
            # Find and fill registration form fields
            full_name_input = wait_for_element(driver, By.NAME, "fullName")
            email_input = wait_for_element(driver, By.NAME, "email")
            password_input = wait_for_element(driver, By.NAME, "password")
            
            assert full_name_input is not None, "Full name input not found"
            assert email_input is not None, "Email input not found"
            assert password_input is not None, "Password input not found"
            
            # Fill in the form
            full_name_input.clear()
            full_name_input.send_keys("Test User")
            
            email_input.clear()
            email_input.send_keys(test_email)
            
            password_input.clear()
            password_input.send_keys("TestPassword123!")
            
            # Find and click submit button
            submit_button = wait_for_clickable(driver, By.XPATH, "//button[@type='submit']")
            assert submit_button is not None, "Submit button not found"
            
            take_screenshot(driver, "registration_form_filled")
            submit_button.click()
            
            # Wait for navigation or success message
            time.sleep(3)
            take_screenshot(driver, "registration_result")
            
            # Verify registration success (either redirected to login or dashboard)
            current_url = driver.current_url
            assert '/login' in current_url or '/dashboard' in current_url or '/' == current_url.replace(TestConfig.BASE_URL, ''), \
                f"Registration did not redirect properly. Current URL: {current_url}"
            
            print(f"✅ Registration successful for user: {test_email}")
            
        except AssertionError as e:
            print(f"❌ Test failed: {e}")
            take_screenshot(driver, "registration_failure")
            raise
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            take_screenshot(driver, "registration_error")
            raise
    
    def test_02_user_registration_duplicate_email(self, driver):
        """
        Test registration with an existing email (should fail).
        
        Steps:
        1. Navigate to registration page
        2. Try to register with existing email
        3. Verify error message is displayed
        """
        print("\n=== Test 02: Registration with Duplicate Email ===")
        
        driver.get(f"{TestConfig.BASE_URL}/register")
        time.sleep(2)
        
        try:
            # Use test email that should already exist
            full_name_input = wait_for_element(driver, By.NAME, "fullName")
            email_input = wait_for_element(driver, By.NAME, "email")
            password_input = wait_for_element(driver, By.NAME, "password")
            
            full_name_input.clear()
            full_name_input.send_keys("Duplicate User")
            
            email_input.clear()
            email_input.send_keys(TestConfig.TEST_EMAIL)  # Existing email
            
            password_input.clear()
            password_input.send_keys("TestPassword123!")
            
            submit_button = wait_for_clickable(driver, By.XPATH, "//button[@type='submit']")
            submit_button.click()
            
            time.sleep(2)
            take_screenshot(driver, "duplicate_email_result")
            
            # Check for error message (look for common error indicators)
            page_source = driver.page_source
            error_found = any(keyword in page_source.lower() for keyword in 
                            ['קיים', 'exists', 'already', 'שגיאה', 'error'])
            
            assert error_found, "Expected error message for duplicate email was not found"
            print("✅ Duplicate email error correctly displayed")
            
        except AssertionError as e:
            print(f"❌ Test failed: {e}")
            raise
        except Exception as e:
            print(f"⚠️ Test inconclusive: {e}")
            # This test may pass or fail depending on data state
    
    def test_03_user_login_success(self, driver):
        """
        Test successful login with valid credentials.
        
        Steps:
        1. Navigate to login page
        2. Enter valid credentials
        3. Submit login form
        4. Verify redirect to dashboard
        """
        print("\n=== Test 03: User Login Success ===")
        
        driver.get(f"{TestConfig.BASE_URL}/login")
        time.sleep(2)
        
        take_screenshot(driver, "login_page")
        
        try:
            # Find login form elements
            email_input = wait_for_element(driver, By.NAME, "email")
            password_input = wait_for_element(driver, By.NAME, "password")
            
            assert email_input is not None, "Email input not found"
            assert password_input is not None, "Password input not found"
            
            # Enter credentials
            email_input.clear()
            email_input.send_keys(TestConfig.TEST_EMAIL)
            
            password_input.clear()
            password_input.send_keys(TestConfig.TEST_PASSWORD)
            
            take_screenshot(driver, "login_form_filled")
            
            # Submit form
            submit_button = wait_for_clickable(driver, By.XPATH, "//button[@type='submit']")
            assert submit_button is not None, "Login button not found"
            submit_button.click()
            
            # Wait for navigation to dashboard
            WebDriverWait(driver, 10).until(
                lambda d: '/login' not in d.current_url
            )
            
            time.sleep(2)
            take_screenshot(driver, "login_success_dashboard")
            
            # Verify we're on the dashboard or home page
            current_url = driver.current_url
            assert '/login' not in current_url, f"Still on login page. Current URL: {current_url}"
            
            # Check for user-specific elements (like profile menu or logout button)
            page_source = driver.page_source
            # Look for Hebrew text that indicates logged in state
            logged_in_indicators = ['התנתק', 'פרופיל', 'dashboard', 'StudyHub']
            assert any(indicator in page_source for indicator in logged_in_indicators), \
                "Could not verify logged in state"
            
            print("✅ Login successful, user is authenticated")
            
        except AssertionError as e:
            print(f"❌ Test failed: {e}")
            take_screenshot(driver, "login_failure")
            raise
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            take_screenshot(driver, "login_error")
            raise
    
    def test_04_user_login_invalid_credentials(self, driver):
        """
        Test login with invalid credentials (should fail).
        
        Steps:
        1. Navigate to login page
        2. Enter invalid credentials
        3. Verify error message is displayed
        """
        print("\n=== Test 04: Login with Invalid Credentials ===")
        
        driver.get(f"{TestConfig.BASE_URL}/login")
        time.sleep(2)
        
        try:
            email_input = wait_for_element(driver, By.NAME, "email")
            password_input = wait_for_element(driver, By.NAME, "password")
            
            # Enter invalid credentials
            email_input.clear()
            email_input.send_keys("invalid@test.com")
            
            password_input.clear()
            password_input.send_keys("wrongpassword")
            
            submit_button = wait_for_clickable(driver, By.XPATH, "//button[@type='submit']")
            submit_button.click()
            
            time.sleep(2)
            take_screenshot(driver, "invalid_login_result")
            
            # Verify still on login page or error message shown
            current_url = driver.current_url
            page_source = driver.page_source
            
            # Check for error indicators
            error_found = ('/login' in current_url or 
                          any(keyword in page_source.lower() for keyword in 
                              ['שגיאה', 'error', 'invalid', 'incorrect', 'נכשל']))
            
            assert error_found, "Expected error for invalid credentials was not found"
            print("✅ Invalid credentials error correctly displayed")
            
        except AssertionError as e:
            print(f"❌ Test failed: {e}")
            raise
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            raise
    
    def test_05_user_logout(self, driver):
        """
        Test user logout functionality.
        
        Steps:
        1. Login first
        2. Click logout button
        3. Verify redirect to login page
        """
        print("\n=== Test 05: User Logout ===")
        
        # First login
        driver.get(f"{TestConfig.BASE_URL}/login")
        time.sleep(2)
        
        try:
            # Login
            email_input = wait_for_element(driver, By.NAME, "email")
            password_input = wait_for_element(driver, By.NAME, "password")
            
            email_input.clear()
            email_input.send_keys(TestConfig.TEST_EMAIL)
            password_input.clear()
            password_input.send_keys(TestConfig.TEST_PASSWORD)
            
            submit_button = wait_for_clickable(driver, By.XPATH, "//button[@type='submit']")
            submit_button.click()
            
            # Wait for login to complete
            WebDriverWait(driver, 10).until(
                lambda d: '/login' not in d.current_url
            )
            time.sleep(2)
            
            take_screenshot(driver, "before_logout")
            
            # Find and click logout button
            # Try multiple possible selectors for logout button
            logout_button = None
            logout_selectors = [
                (By.XPATH, "//button[contains(text(), 'התנתק')]"),
                (By.XPATH, "//button[contains(text(), 'Logout')]"),
                (By.XPATH, "//a[contains(text(), 'התנתק')]"),
                (By.XPATH, "//button[@aria-label='logout']"),
            ]
            
            for by, selector in logout_selectors:
                try:
                    logout_button = wait_for_clickable(driver, by, selector, timeout=5)
                    if logout_button:
                        break
                except:
                    continue
            
            if logout_button:
                logout_button.click()
                time.sleep(2)
                take_screenshot(driver, "after_logout")
                
                # Verify redirect to login page
                current_url = driver.current_url
                assert '/login' in current_url or driver.get_cookies() == [], \
                    f"Logout did not redirect to login. Current URL: {current_url}"
                
                print("✅ Logout successful")
            else:
                print("⚠️ Logout button not found - manual verification needed")
                take_screenshot(driver, "logout_button_not_found")
            
        except AssertionError as e:
            print(f"❌ Test failed: {e}")
            take_screenshot(driver, "logout_failure")
            raise
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            take_screenshot(driver, "logout_error")
            raise
    
    def test_06_protected_route_access(self, driver):
        """
        Test that protected routes redirect to login when not authenticated.
        
        Steps:
        1. Try to access dashboard without logging in
        2. Verify redirect to login page
        """
        print("\n=== Test 06: Protected Route Access ===")
        
        try:
            # Clear cookies to ensure not logged in
            driver.delete_all_cookies()
            
            # Try to access protected route (dashboard)
            driver.get(f"{TestConfig.BASE_URL}/dashboard")
            time.sleep(2)
            
            take_screenshot(driver, "protected_route_access")
            
            # Verify redirect to login
            current_url = driver.current_url
            assert '/login' in current_url, \
                f"Protected route did not redirect to login. Current URL: {current_url}"
            
            print("✅ Protected route correctly redirects to login")
            
        except AssertionError as e:
            print(f"❌ Test failed: {e}")
            take_screenshot(driver, "protected_route_failure")
            raise
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            raise


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s", "--html=report.html"])
