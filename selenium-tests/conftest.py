"""
Base Configuration for Selenium Tests
This module provides common utilities and fixtures for all Selenium tests.
"""

import os
import pytest
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class TestConfig:
    """Test configuration class"""
    BASE_URL = os.getenv('BASE_URL', 'http://localhost:3000')  # Changed from 5173 to 3000
    API_URL = os.getenv('API_URL', 'http://localhost:4000')
    
    # Test credentials
    TEST_EMAIL = os.getenv('TEST_EMAIL', 'h0559137459@gmail.com')
    TEST_PASSWORD = os.getenv('TEST_PASSWORD', 'Vhbsh148@')
    TEST_ADMIN_EMAIL = os.getenv('TEST_ADMIN_EMAIL', 'admin@studyhub.local')
    TEST_ADMIN_PASSWORD = os.getenv('TEST_ADMIN_PASSWORD', 'admin123')
    
    # Selenium settings
    IMPLICIT_WAIT = int(os.getenv('IMPLICIT_WAIT', '10'))
    PAGE_LOAD_TIMEOUT = int(os.getenv('PAGE_LOAD_TIMEOUT', '30'))
    HEADLESS_MODE = os.getenv('HEADLESS_MODE', 'false').lower() == 'true'
    BROWSER = os.getenv('BROWSER', 'chrome')
    
    # Screenshot settings
    SCREENSHOT_ON_FAILURE = os.getenv('SCREENSHOT_ON_FAILURE', 'true').lower() == 'true'
    SCREENSHOT_DIR = os.getenv('SCREENSHOT_DIR', 'screenshots')


@pytest.fixture(scope='function')
def driver():
    """
    Create and configure a WebDriver instance for testing.
    This fixture is function-scoped, meaning each test gets a fresh browser.
    """
    # Set up Chrome options
    chrome_options = Options()
    
    if TestConfig.HEADLESS_MODE:
        chrome_options.add_argument('--headless')
    
    # Additional Chrome options for stability
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging', 'enable-automation'])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Initialize the WebDriver
    # Selenium 4.6+ includes automatic driver management (no need for webdriver-manager)
    driver = webdriver.Chrome(options=chrome_options)

    # Set timeouts
    driver.implicitly_wait(TestConfig.IMPLICIT_WAIT)
    driver.set_page_load_timeout(TestConfig.PAGE_LOAD_TIMEOUT)
    
    # Maximize window (unless headless)
    if not TestConfig.HEADLESS_MODE:
        driver.maximize_window()
    
    yield driver
    
    # Teardown: quit the driver
    driver.quit()


@pytest.fixture(scope='function')
def authenticated_driver(driver):
    """
    Fixture that provides an authenticated WebDriver instance.
    Logs in with test credentials before yielding the driver.
    """
    # Navigate to login page
    driver.get(f"{TestConfig.BASE_URL}/login")
    
    # Wait for page to load
    WebDriverWait(driver, 10).until(
        lambda d: d.execute_script('return document.readyState') == 'complete'
    )
    
    # Perform login (implementation depends on actual login form)
    # This is a placeholder - actual implementation will be in the login test
    try:
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support import expected_conditions as EC
        
        # Wait for login form
        email_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "email"))
        )
        password_input = driver.find_element(By.NAME, "password")
        
        # Enter credentials
        email_input.clear()
        email_input.send_keys(TestConfig.TEST_EMAIL)
        password_input.clear()
        password_input.send_keys(TestConfig.TEST_PASSWORD)
        
        # Submit form
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Wait for navigation to dashboard
        WebDriverWait(driver, 10).until(
            lambda d: TestConfig.BASE_URL in d.current_url and '/login' not in d.current_url
        )
        
    except Exception as e:
        print(f"Authentication failed: {e}")
        # Take a screenshot for debugging
        take_screenshot(driver, "authentication_failure")
        raise
    
    yield driver


def take_screenshot(driver, name):
    """
    Take a screenshot and save it with a timestamp.
    
    Args:
        driver: WebDriver instance
        name: Name for the screenshot file
    """
    if not TestConfig.SCREENSHOT_ON_FAILURE:
        return
    
    # Create screenshots directory if it doesn't exist
    os.makedirs(TestConfig.SCREENSHOT_DIR, exist_ok=True)
    
    # Generate filename with timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{name}_{timestamp}.png"
    filepath = os.path.join(TestConfig.SCREENSHOT_DIR, filename)
    
    # Save screenshot
    driver.save_screenshot(filepath)
    print(f"Screenshot saved: {filepath}")


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """
    Hook to take screenshots on test failure.
    """
    outcome = yield
    rep = outcome.get_result()
    
    if rep.when == 'call' and rep.failed:
        if 'driver' in item.funcargs:
            driver = item.funcargs['driver']
            take_screenshot(driver, f"test_failure_{item.name}")


def wait_for_element(driver, by, value, timeout=10):
    """
    Wait for an element to be present and return it.
    
    Args:
        driver: WebDriver instance
        by: By locator strategy
        value: Locator value
        timeout: Maximum wait time in seconds
        
    Returns:
        WebElement or None
    """
    from selenium.webdriver.support import expected_conditions as EC
    
    try:
        element = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((by, value))
        )
        return element
    except Exception as e:
        print(f"Element not found: {by}={value}, Error: {e}")
        return None


def wait_for_clickable(driver, by, value, timeout=10):
    """
    Wait for an element to be clickable and return it.
    
    Args:
        driver: WebDriver instance
        by: By locator strategy
        value: Locator value
        timeout: Maximum wait time in seconds
        
    Returns:
        WebElement or None
    """
    from selenium.webdriver.support import expected_conditions as EC
    
    try:
        element = WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable((by, value))
        )
        return element
    except Exception as e:
        print(f"Element not clickable: {by}={value}, Error: {e}")
        return None


def scroll_to_element(driver, element):
    """
    Scroll to make an element visible.
    
    Args:
        driver: WebDriver instance
        element: WebElement to scroll to
    """
    driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element)
    import time
    time.sleep(0.5)  # Wait for scroll animation


def safe_click(driver, element):
    """
    Safely click an element (handles common click issues).
    
    Args:
        driver: WebDriver instance
        element: WebElement to click
    """
    try:
        # Try normal click
        element.click()
    except Exception:
        # If normal click fails, try JavaScript click
        driver.execute_script("arguments[0].click();", element)
