# Selenium Testing Quick Reference - StudyHub-IL
## מדריך ייחוס מהיר לבדיקות Selenium

---

## 🚀 התחלה מהירה

### התקנה
```bash
cd selenium-tests
pip install -r requirements.txt
cp .env.example .env
```

### הרצה בסיסית
```bash
# כל הבדיקות
pytest -v

# בדיקה ספציפית
pytest test_01_user_authentication.py -v

# עם דוח HTML
pytest --html=report.html --self-contained-html
```

---

## 📝 דוגמאות קוד נפוצות

### 1. פתיחת דפדפן
```python
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install())
)
driver.maximize_window()
driver.get("http://localhost:5173")
```

### 2. חיפוש אלמנטים
```python
from selenium.webdriver.common.by import By

# לפי ID
element = driver.find_element(By.ID, "username")

# לפי Name
element = driver.find_element(By.NAME, "email")

# לפי Class
element = driver.find_element(By.CLASS_NAME, "btn-primary")

# לפי XPath
element = driver.find_element(By.XPATH, "//input[@id='username']")

# לפי CSS Selector
element = driver.find_element(By.CSS_SELECTOR, "#username")

# לפי Link Text
element = driver.find_element(By.LINK_TEXT, "התחבר")

# לפי Partial Link Text
element = driver.find_element(By.PARTIAL_LINK_TEXT, "התח")

# לפי Tag Name
element = driver.find_element(By.TAG_NAME, "button")
```

### 3. פעולות על אלמנטים
```python
# הזנת טקסט
element.clear()
element.send_keys("student@studyhub.local")

# לחיצה
element.click()

# קבלת טקסט
text = element.text

# קבלת attribute
value = element.get_attribute("value")

# בדיקה אם גלוי
is_visible = element.is_displayed()

# בדיקה אם מופעל
is_enabled = element.is_enabled()

# בדיקה אם נבחר (checkbox/radio)
is_selected = element.is_selected()
```

### 4. המתנות (Waits)
```python
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Implicit Wait (גלובלי)
driver.implicitly_wait(10)

# Explicit Wait (ספציפי)
wait = WebDriverWait(driver, 10)

# המתן עד שאלמנט מופיע
element = wait.until(
    EC.presence_of_element_located((By.ID, "myElement"))
)

# המתן עד שאלמנט ניתן ללחיצה
element = wait.until(
    EC.element_to_be_clickable((By.ID, "myButton"))
)

# המתן עד שאלמנט גלוי
element = wait.until(
    EC.visibility_of_element_located((By.ID, "myElement"))
)

# המתן עד שטקסט מופיע
wait.until(
    EC.text_to_be_present_in_element((By.ID, "result"), "7.50")
)

# המתן עד שכתובת URL מכילה טקסט
wait.until(EC.url_contains("/dashboard"))
```

### 5. ניווט
```python
# פתיחת URL
driver.get("http://localhost:5173/login")

# כתובת נוכחית
current_url = driver.current_url

# כותרת
title = driver.title

# אחורה
driver.back()

# קדימה
driver.forward()

# רענון
driver.refresh()
```

### 6. טיפול בחלונות ו-Tabs
```python
# פתיחת tab חדש
driver.execute_script("window.open('');")

# קבלת כל ה-handles
windows = driver.window_handles

# מעבר ל-tab אחר
driver.switch_to.window(windows[1])

# סגירת tab נוכחי
driver.close()

# סגירת כל הדפדפן
driver.quit()
```

### 7. Alerts
```python
# המתן ל-alert
wait.until(EC.alert_is_present())

# עבור ל-alert
alert = driver.switch_to.alert

# קבלת טקסט
alert_text = alert.text

# אישור
alert.accept()

# ביטול
alert.dismiss()

# הזנת טקסט (prompt)
alert.send_keys("text")
```

### 8. Dropdown
```python
from selenium.webdriver.support.select import Select

# מצא את ה-dropdown
dropdown = driver.find_element(By.ID, "myDropdown")
select = Select(dropdown)

# בחירה לפי index
select.select_by_index(2)

# בחירה לפי value
select.select_by_value("option2")

# בחירה לפי טקסט נראה
select.select_by_visible_text("Outstanding - 30%")

# קבלת האופציה הנבחרת
selected = select.first_selected_option
```

### 9. צילום מסך
```python
# צילום של כל העמוד
driver.save_screenshot("screenshot.png")

# או
driver.get_screenshot_as_file("screenshot.png")

# צילום של אלמנט ספציפי (Selenium 4+)
element.screenshot("element.png")
```

### 10. JavaScript Execution
```python
# הרצת JavaScript
driver.execute_script("alert('Hello');")

# גלילה לתחתית העמוד
driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")

# גלילה לאלמנט
driver.execute_script("arguments[0].scrollIntoView();", element)

# לחיצה דרך JavaScript
driver.execute_script("arguments[0].click();", element)
```

---

## 🧪 תבניות Pytest

### בדיקה בסיסית
```python
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By

class TestLogin:
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup לפני כל בדיקה"""
        self.driver = webdriver.Chrome()
        self.driver.maximize_window()
        yield
        self.driver.quit()
    
    def test_login_success(self):
        """בדיקת התחברות מוצלחת"""
        self.driver.get("http://localhost:5173/login")
        
        # מילוי טופס
        self.driver.find_element(By.NAME, "email").send_keys("test@test.com")
        self.driver.find_element(By.NAME, "password").send_keys("password")
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()
        
        # בדיקה
        assert "/dashboard" in self.driver.current_url
```

### שימוש ב-Fixtures
```python
# conftest.py
import pytest
from selenium import webdriver

@pytest.fixture(scope="function")
def driver():
    """Driver fixture"""
    driver = webdriver.Chrome()
    driver.maximize_window()
    yield driver
    driver.quit()

@pytest.fixture
def authenticated_driver(driver):
    """Driver מחובר"""
    driver.get("http://localhost:5173/login")
    driver.find_element(By.NAME, "email").send_keys("student@studyhub.local")
    driver.find_element(By.NAME, "password").send_keys("password123")
    driver.find_element(By.XPATH, "//button[@type='submit']").click()
    return driver

# test_file.py
def test_profile(authenticated_driver):
    """בדיקה עם משתמש מחובר"""
    authenticated_driver.get("http://localhost:5173/profile")
    assert "פרופיל" in authenticated_driver.title
```

### Parametrize
```python
@pytest.mark.parametrize("email,password,expected", [
    ("valid@test.com", "password123", True),
    ("invalid@test.com", "wrong", False),
    ("", "password", False),
])
def test_login_combinations(driver, email, password, expected):
    """בדיקת קומבינציות התחברות"""
    driver.get("http://localhost:5173/login")
    driver.find_element(By.NAME, "email").send_keys(email)
    driver.find_element(By.NAME, "password").send_keys(password)
    driver.find_element(By.XPATH, "//button[@type='submit']").click()
    
    if expected:
        assert "/dashboard" in driver.current_url
    else:
        assert "/login" in driver.current_url
```

### Markers
```python
# סימון בדיקות
@pytest.mark.smoke
def test_homepage_loads():
    """בדיקת smoke"""
    pass

@pytest.mark.critical
def test_user_login():
    """בדיקה קריטית"""
    pass

@pytest.mark.slow
def test_upload_large_file():
    """בדיקה איטית"""
    pass

# הרצה:
# pytest -m smoke
# pytest -m "critical and not slow"
```

---

## 🔍 XPath למתקדמים

### תחביר בסיסי
```python
# כל האלמנטים מסוג input
"//input"

# input עם id מסוים
"//input[@id='username']"

# input עם type מסוים
"//input[@type='email']"

# אלמנט עם מספר תכונות
"//input[@type='text' and @name='username']"

# אלמנט שמכיל טקסט
"//button[text()='התחבר']"

# אלמנט שמכיל טקסט חלקי
"//button[contains(text(),'התח')]"

# אלמנט לפי class
"//div[@class='container']"

# אלמנט שה-class שלו מכיל
"//div[contains(@class, 'btn')]"
```

### צירים (Axes)
```python
# הורה
"//input[@id='username']/.."

# צאצא
"//form//input"

# אח הבא
"//label[@for='username']/following-sibling::input"

# אח הקודם
"//input/preceding-sibling::label"

# ילד
"//div/child::span"

# parent
"//input/parent::div"
```

### דוגמאות מתקדמות
```python
# האלמנט ה-N
"(//input)[3]"

# האלמנט האחרון
"(//input)[last()]"

# האלמנט האחרון פחות 1
"(//input)[last()-1]"

# כל ה-inputs מלבד הראשון
"//input[position()>1]"

# input שהvalue שלו מתחיל ב
"//input[starts-with(@value, 'test')]"

# div שיש לו input בתוכו
"//div[.//input]"

# div שאין לו class
"//div[not(@class)]"
```

---

## 📦 פקודות CLI שימושיות

### Pytest
```bash
# הרצה רגילה
pytest

# verbose
pytest -v

# עם הדפסות
pytest -v -s

# עם traceback קצר
pytest --tb=short

# רק בדיקות שנכשלו בפעם האחרונה
pytest --lf

# רק בדיקות חדשות/משונות
pytest --nf

# הצג X בדיקות איטיות
pytest --durations=10

# בדיקה ספציפית
pytest test_file.py::TestClass::test_method

# עם markers
pytest -m smoke

# מקבילי
pytest -n 4  # צריך pytest-xdist

# עצירה אחרי כשל ראשון
pytest -x

# עצירה אחרי N כשלונות
pytest --maxfail=3
```

### דוחות
```bash
# HTML report
pytest --html=report.html --self-contained-html

# JUnit XML (CI/CD)
pytest --junitxml=results.xml

# Coverage
pytest --cov=. --cov-report=html
```

---

## 🐛 טיפול בשגיאות נפוצות

### NoSuchElementException
```python
# ❌ רע
element = driver.find_element(By.ID, "button")

# ✅ טוב
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

element = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.ID, "button"))
)
```

### StaleElementReferenceException
```python
# ❌ רע
element = driver.find_element(By.ID, "button")
time.sleep(5)
element.click()  # עלול להיכשל

# ✅ טוב
driver.find_element(By.ID, "button").click()
```

### ElementNotInteractableException
```python
# ❌ רע
element.click()

# ✅ טוב
wait = WebDriverWait(driver, 10)
element = wait.until(EC.element_to_be_clickable((By.ID, "button")))
element.click()

# או דרך JavaScript
driver.execute_script("arguments[0].click();", element)
```

### TimeoutException
```python
# הגדל זמן המתנה
wait = WebDriverWait(driver, 30)  # במקום 10

# או טפל בחריגה
try:
    element = wait.until(EC.presence_of_element_located((By.ID, "myElement")))
except TimeoutException:
    print("האלמנט לא נמצא אחרי 30 שניות")
    driver.save_screenshot("timeout_error.png")
```

---

## 💡 Best Practices

### 1. Page Object Model
```python
# pages/login_page.py
class LoginPage:
    def __init__(self, driver):
        self.driver = driver
        self.email_input = (By.NAME, "email")
        self.password_input = (By.NAME, "password")
        self.submit_button = (By.XPATH, "//button[@type='submit']")
    
    def login(self, email, password):
        self.driver.find_element(*self.email_input).send_keys(email)
        self.driver.find_element(*self.password_input).send_keys(password)
        self.driver.find_element(*self.submit_button).click()

# test_login.py
def test_login(driver):
    login_page = LoginPage(driver)
    login_page.login("test@test.com", "password")
    assert "/dashboard" in driver.current_url
```

### 2. Custom Waits
```python
def wait_for_element(driver, by, value, timeout=10):
    """המתן לאלמנט עם טיפול בשגיאות"""
    try:
        wait = WebDriverWait(driver, timeout)
        return wait.until(EC.presence_of_element_located((by, value)))
    except TimeoutException:
        driver.save_screenshot(f"element_not_found_{value}.png")
        raise

def wait_for_clickable(driver, by, value, timeout=10):
    """המתן עד שאלמנט ניתן ללחיצה"""
    wait = WebDriverWait(driver, timeout)
    return wait.until(EC.element_to_be_clickable((by, value)))
```

### 3. צילומי מסך אוטומטיים
```python
import datetime

def take_screenshot(driver, name):
    """צילום מסך עם timestamp"""
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"screenshots/{name}_{timestamp}.png"
    driver.save_screenshot(filename)
    print(f"📸 Screenshot saved: {filename}")
    return filename

# שימוש
take_screenshot(driver, "login_page")
```

### 4. Data-Driven Testing
```python
import csv

def get_test_data(filename):
    """קריאת נתונים מ-CSV"""
    with open(filename, 'r', encoding='utf-8') as file:
        return list(csv.DictReader(file))

# test_data.csv:
# email,password,expected
# valid@test.com,password123,success
# invalid@test.com,wrong,fail

@pytest.mark.parametrize("data", get_test_data("test_data.csv"))
def test_login_from_csv(driver, data):
    # בדיקה עם נתונים מקובץ
    pass
```

---

## 🎯 שאלות נפוצות (FAQ)

### Q: איך אני יודע איזה selector להשתמש?
**A:** סדר עדיפות מומלץ:
1. ID (הכי יציב)
2. Name
3. CSS Selector
4. XPath (גמיש אבל עלול להישבר)

### Q: מה ההבדל בין find_element ל-find_elements?
**A:**
- `find_element` - מחזיר אלמנט אחד, זורק חריגה אם לא נמצא
- `find_elements` - מחזיר רשימה, רשימה ריקה אם לא נמצא

### Q: מתי להשתמש ב-Implicit vs Explicit Wait?
**A:**
- Implicit - גלובלי, טוב לפיתוח מהיר
- Explicit - ספציפי לכל אלמנט, מומלץ לייצור

### Q: איך אני מריץ בדיקות במקביל?
**A:**
```bash
pip install pytest-xdist
pytest -n 4  # 4 workers
```

### Q: איך אני מטפל באלמנט שלא בתוך ה-viewport?
**A:**
```python
# גלול לאלמנט
driver.execute_script("arguments[0].scrollIntoView();", element)
# לחץ
element.click()
```

---

## 📚 משאבים מהירים

### קישורים חשובים
- [Selenium Docs](https://www.selenium.dev/documentation/)
- [Pytest Docs](https://docs.pytest.org/)
- [XPath Cheat Sheet](https://devhints.io/xpath)
- [CSS Selectors](https://www.w3schools.com/cssref/css_selectors.asp)

### קבצי תצורה בפרויקט
- `selenium-tests/conftest.py` - Fixtures
- `selenium-tests/.env` - הגדרות
- `selenium-tests/pytest.ini` - תצורת Pytest
- `selenium-tests/requirements.txt` - תלויות

### פקודות מהירות
```bash
# התחלה
cd selenium-tests && pip install -r requirements.txt

# הרצה
pytest -v

# דוח
pytest --html=report.html --self-contained-html
```

---

**עדכון אחרון:** ינואר 2025  
**גרסה:** 1.0  
**פרויקט:** StudyHub-IL
