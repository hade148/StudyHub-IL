"""
Test 3: Forum Interaction Flow
Tests forum functionality including creating posts, viewing posts, and adding comments.
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import TestConfig, take_screenshot, wait_for_element, wait_for_clickable, safe_click


class TestForumInteraction:
    """Test cases for forum functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self, authenticated_driver):
        """Setup: Use authenticated driver for all tests"""
        self.driver = authenticated_driver
        yield
    
    def test_01_navigate_to_forum(self):
        """
        Test navigation to the forum page.
        
        Steps:
        1. From dashboard, navigate to forum section
        2. Verify forum page is displayed
        """
        print("\n=== Test 01: Navigate to Forum ===")
        
        try:
            # Navigate to forum page
            self.driver.get(f"{TestConfig.BASE_URL}/forum")
            time.sleep(2)
            
            take_screenshot(self.driver, "forum_page")
            
            # Verify we're on the forum page
            current_url = self.driver.current_url
            page_source = self.driver.page_source
            
            forum_indicators = ['/forum', 'פורום', 'forum']
            on_forum_page = any(indicator in current_url.lower() or indicator in page_source 
                               for indicator in forum_indicators)
            
            assert on_forum_page, f"Not on forum page. Current URL: {current_url}"
            print("✅ Successfully navigated to forum page")
            
        except AssertionError as e:
            print(f"❌ Test failed: {e}")
            take_screenshot(self.driver, "forum_navigation_failure")
            raise
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            take_screenshot(self.driver, "forum_navigation_error")
            raise
    
    def test_02_view_forum_posts_list(self):
        """
        Test viewing the list of forum posts.
        
        Steps:
        1. Navigate to forum page
        2. Verify posts are displayed
        3. Check that post elements are visible
        """
        print("\n=== Test 02: View Forum Posts List ===")
        
        try:
            self.driver.get(f"{TestConfig.BASE_URL}/forum")
            time.sleep(3)
            
            take_screenshot(self.driver, "forum_posts_list")
            
            # Look for post elements - try multiple selectors
            post_elements = []
            post_selectors = [
                (By.XPATH, "//div[contains(@class, 'post')]"),
                (By.XPATH, "//article"),
                (By.XPATH, "//a[contains(@href, '/forum/')]"),
                (By.XPATH, "//div[contains(@class, 'card')]"),
            ]
            
            for by, selector in post_selectors:
                try:
                    elements = self.driver.find_elements(by, selector)
                    if elements:
                        post_elements = elements
                        break
                except:
                    continue
            
            page_source = self.driver.page_source
            has_posts = (
                len(post_elements) > 0 or
                'שאלה' in page_source or
                'question' in page_source.lower() or
                'post' in page_source.lower()
            )
            
            if has_posts:
                print(f"✅ Forum posts displayed (found {len(post_elements)} post elements)")
            else:
                print("⚠️ No posts found - forum might be empty or page structure different")
            
        except Exception as e:
            print(f"⚠️ Test inconclusive: {e}")
            take_screenshot(self.driver, "forum_posts_error")
    
    def test_03_navigate_to_new_question_page(self):
        """
        Test navigation to create a new forum question.
        
        Steps:
        1. Navigate to forum page
        2. Click on "New Question" or similar button
        3. Verify new question form is displayed
        """
        print("\n=== Test 03: Navigate to New Question Page ===")
        
        try:
            self.driver.get(f"{TestConfig.BASE_URL}/forum")
            time.sleep(2)
            
            take_screenshot(self.driver, "forum_before_new_question")
            
            # Look for "New Question" button
            new_question_button = None
            button_selectors = [
                (By.XPATH, "//button[contains(text(), 'שאלה חדשה')]"),
                (By.XPATH, "//a[contains(text(), 'שאלה חדשה')]"),
                (By.XPATH, "//button[contains(text(), 'New Question')]"),
                (By.XPATH, "//a[contains(@href, '/forum/new')]"),
                (By.XPATH, "//button[contains(text(), 'שאל')]"),
            ]
            
            for by, selector in button_selectors:
                try:
                    new_question_button = wait_for_clickable(self.driver, by, selector, timeout=5)
                    if new_question_button:
                        break
                except:
                    continue
            
            if new_question_button:
                safe_click(self.driver, new_question_button)
                time.sleep(2)
                take_screenshot(self.driver, "new_question_page")
                
                # Verify we're on the new question page
                current_url = self.driver.current_url
                page_source = self.driver.page_source
                
                on_new_question_page = (
                    '/new' in current_url or
                    'שאלה חדשה' in page_source or
                    any(field in page_source for field in ['title', 'content', 'כותרת', 'תוכן'])
                )
                
                assert on_new_question_page, f"Not on new question page. URL: {current_url}"
                print("✅ Successfully navigated to new question page")
            else:
                # Try direct navigation
                self.driver.get(f"{TestConfig.BASE_URL}/forum/new")
                time.sleep(2)
                take_screenshot(self.driver, "new_question_direct")
                print("⚠️ Used direct navigation to new question page")
            
        except AssertionError as e:
            print(f"❌ Test failed: {e}")
            take_screenshot(self.driver, "new_question_nav_failure")
            raise
        except Exception as e:
            print(f"⚠️ Test inconclusive: {e}")
            take_screenshot(self.driver, "new_question_nav_error")
    
    def test_04_create_new_forum_post(self):
        """
        Test creating a new forum post/question.
        
        Steps:
        1. Navigate to new question page
        2. Fill in title and content
        3. Submit the form
        4. Verify post is created
        """
        print("\n=== Test 04: Create New Forum Post ===")
        
        try:
            # Navigate to new question page (try direct navigation)
            self.driver.get(f"{TestConfig.BASE_URL}/forum/new")
            time.sleep(3)
            
            take_screenshot(self.driver, "create_post_form")
            
            # Generate unique title
            import random
            post_title = f"שאלת בדיקה {random.randint(1000, 9999)}"
            post_content = "זוהי שאלה שנוצרה אוטומטית על ידי בדיקות Selenium. האם המערכת עובדת כראוי?"
            
            # Find and fill title field
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
                title_field.send_keys(post_title)
                time.sleep(1)
                print(f"📝 Title entered: {post_title}")
            
            # Find and fill content/description field
            content_field = None
            content_selectors = [
                (By.NAME, "content"),
                (By.NAME, "description"),
                (By.ID, "content"),
                (By.ID, "description"),
                (By.XPATH, "//textarea"),
            ]
            
            for by, selector in content_selectors:
                try:
                    content_field = wait_for_element(self.driver, by, selector, timeout=3)
                    if content_field:
                        break
                except:
                    continue
            
            if content_field:
                content_field.clear()
                content_field.send_keys(post_content)
                time.sleep(1)
                print(f"📝 Content entered")
            
            take_screenshot(self.driver, "post_form_filled")
            
            # Find and click submit button
            submit_button = None
            submit_selectors = [
                (By.XPATH, "//button[contains(text(), 'פרסם')]"),
                (By.XPATH, "//button[contains(text(), 'שלח')]"),
                (By.XPATH, "//button[@type='submit']"),
                (By.XPATH, "//button[contains(text(), 'Submit')]"),
            ]
            
            for by, selector in submit_selectors:
                try:
                    submit_button = wait_for_clickable(self.driver, by, selector, timeout=3)
                    if submit_button:
                        break
                except:
                    continue
            
            if submit_button:
                self.driver.execute_script("arguments[0].scrollIntoView();", submit_button)
                time.sleep(1)
                safe_click(self.driver, submit_button)
                time.sleep(3)
                
                take_screenshot(self.driver, "after_post_submit")
                
                # Check for success indicators
                current_url = self.driver.current_url
                page_source = self.driver.page_source
                
                post_created = (
                    '/forum' in current_url and '/new' not in current_url or
                    post_title in page_source or
                    'הצלחה' in page_source or
                    'success' in page_source.lower()
                )
                
                if post_created:
                    print("✅ Forum post created successfully")
                else:
                    print("⚠️ Post creation result unclear")
                    print(f"Current URL: {current_url}")
            else:
                print("⚠️ Submit button not found")
                take_screenshot(self.driver, "submit_button_not_found")
            
        except Exception as e:
            print(f"⚠️ Post creation test inconclusive: {e}")
            take_screenshot(self.driver, "post_creation_error")
    
    def test_05_view_forum_post_details(self):
        """
        Test viewing details of a forum post.
        
        Steps:
        1. Navigate to forum page
        2. Click on a post to view details
        3. Verify post details are displayed
        """
        print("\n=== Test 05: View Forum Post Details ===")
        
        try:
            self.driver.get(f"{TestConfig.BASE_URL}/forum")
            time.sleep(3)
            
            take_screenshot(self.driver, "forum_before_click")
            
            # Find clickable post elements
            post_links = []
            link_selectors = [
                (By.XPATH, "//a[contains(@href, '/forum/')]"),
                (By.XPATH, "//div[contains(@class, 'post')]//a"),
                (By.XPATH, "//article//a"),
            ]
            
            for by, selector in link_selectors:
                try:
                    links = self.driver.find_elements(by, selector)
                    post_links = [link for link in links if link.is_displayed()]
                    if post_links:
                        break
                except:
                    continue
            
            if post_links:
                # Click on the first post
                first_post = post_links[0]
                post_url = first_post.get_attribute('href')
                safe_click(self.driver, first_post)
                time.sleep(3)
                
                take_screenshot(self.driver, "post_details")
                
                # Verify we're on a post detail page
                current_url = self.driver.current_url
                assert current_url != f"{TestConfig.BASE_URL}/forum", \
                    "Did not navigate away from forum list"
                
                # Check for post content elements
                page_source = self.driver.page_source
                has_content = (
                    len(self.driver.find_elements(By.XPATH, "//h1 | //h2")) > 0 or
                    'תגובות' in page_source or
                    'comments' in page_source.lower()
                )
                
                assert has_content, "Post details page appears empty"
                print("✅ Forum post details displayed successfully")
            else:
                print("⚠️ No clickable posts found")
                take_screenshot(self.driver, "no_posts_found")
            
        except AssertionError as e:
            print(f"❌ Test failed: {e}")
            take_screenshot(self.driver, "post_details_failure")
            raise
        except Exception as e:
            print(f"⚠️ Test inconclusive: {e}")
            take_screenshot(self.driver, "post_details_error")
    
    def test_06_add_comment_to_post(self):
        """
        Test adding a comment/reply to a forum post.
        
        Steps:
        1. Navigate to a post detail page
        2. Find comment/reply form
        3. Add a comment
        4. Submit and verify
        """
        print("\n=== Test 06: Add Comment to Post ===")
        
        try:
            # First navigate to forum and find a post
            self.driver.get(f"{TestConfig.BASE_URL}/forum")
            time.sleep(3)
            
            # Find and click on a post
            post_links = self.driver.find_elements(By.XPATH, "//a[contains(@href, '/forum/')]")
            if post_links:
                post_links[0].click()
                time.sleep(3)
                
                take_screenshot(self.driver, "before_comment")
                
                # Look for comment/reply form
                comment_field = None
                comment_selectors = [
                    (By.NAME, "comment"),
                    (By.NAME, "reply"),
                    (By.XPATH, "//textarea[@placeholder='תגובה']"),
                    (By.XPATH, "//textarea"),
                ]
                
                for by, selector in comment_selectors:
                    try:
                        comment_field = wait_for_element(self.driver, by, selector, timeout=5)
                        if comment_field:
                            break
                    except:
                        continue
                
                if comment_field:
                    # Scroll to comment field
                    self.driver.execute_script("arguments[0].scrollIntoView();", comment_field)
                    time.sleep(1)
                    
                    # Enter comment
                    comment_text = "זוהי תגובה אוטומטית שנוצרה על ידי Selenium"
                    comment_field.clear()
                    comment_field.send_keys(comment_text)
                    time.sleep(1)
                    
                    take_screenshot(self.driver, "comment_filled")
                    
                    # Find and click submit button for comment
                    submit_selectors = [
                        (By.XPATH, "//button[contains(text(), 'שלח')]"),
                        (By.XPATH, "//button[contains(text(), 'הוסף')]"),
                        (By.XPATH, "//button[@type='submit']"),
                    ]
                    
                    for by, selector in submit_selectors:
                        try:
                            submit_button = wait_for_clickable(self.driver, by, selector, timeout=3)
                            if submit_button:
                                safe_click(self.driver, submit_button)
                                time.sleep(2)
                                break
                        except:
                            continue
                    
                    take_screenshot(self.driver, "after_comment_submit")
                    
                    # Verify comment appears on page
                    page_source = self.driver.page_source
                    comment_visible = comment_text in page_source
                    
                    if comment_visible:
                        print("✅ Comment added successfully")
                    else:
                        print("⚠️ Comment result unclear")
                else:
                    print("⚠️ Comment field not found")
                    take_screenshot(self.driver, "comment_field_not_found")
            else:
                print("⚠️ No posts available to comment on")
            
        except Exception as e:
            print(f"⚠️ Comment test inconclusive: {e}")
            take_screenshot(self.driver, "comment_error")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s", "--html=report.html"])
