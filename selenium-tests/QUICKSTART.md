# מדריך התחלה מהירה - בדיקות Selenium
## Quick Start Guide - Selenium Tests

---

## 📋 הוראות מהירות (Quick Instructions)

### שלב 1: הכנה (Setup)

```bash
# 1. נווט לתיקיית הבדיקות
cd selenium-tests

# 2. התקן Python dependencies
pip install -r requirements.txt

# 3. העתק והגדר קובץ סביבה
cp .env.example .env
# ערוך את .env במידת הצורך
```

### שלב 2: הפעלת האפליקציה (Start Application)

**Terminal 1 - Backend:**
```bash
cd server
npm install  # פעם ראשונה בלבד
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install  # פעם ראשונה בלבד
npm run dev
```

**המתן** עד ששני השרתים עולים!

### שלב 3: הרצת הבדיקות (Run Tests)

**אופציה 1: סקריפט מוכן (מומלץ)**
```bash
./run_tests.sh
```

**אופציה 2: פקודת pytest ישירה**
```bash
pytest -v
```

**אופציה 3: בדיקה ספציפית**
```bash
pytest test_01_user_authentication.py -v
```

---

## 🎯 פקודות נפוצות (Common Commands)

### הרצת כל הבדיקות
```bash
pytest -v
```

### הרצה עם דוח HTML
```bash
pytest --html=report.html --self-contained-html
```

### הרצה במצב headless (ללא חלון דפדפן)
```bash
# הגדר ב-.env: HEADLESS_MODE=true
pytest -v
```

### הרצת בדיקה אחת
```bash
pytest test_01_user_authentication.py::TestUserAuthentication::test_03_user_login_success -v
```

### הרצה עם פלט מפורט
```bash
pytest -v -s
```

---

## 📁 מבנה הקבצים (File Structure)

```
selenium-tests/
├── conftest.py                           # הגדרות בסיס ו-fixtures
├── pytest.ini                            # קונפיגורציה של pytest
├── requirements.txt                      # תלויות Python
├── .env.example                          # דוגמה להגדרות סביבה
├── .env                                  # הגדרות סביבה (לא במערכת גרסאות)
├── run_tests.sh                          # סקריפט הרצה
├── README.md                             # תיעוד מלא
│
├── test_01_user_authentication.py        # בדיקות אימות (6 בדיקות)
├── test_02_summary_upload.py            # בדיקות העלאת סיכומים (6 בדיקות)
├── test_03_forum_interaction.py         # בדיקות פורום (6 בדיקות)
├── test_04_tools_usage.py               # בדיקות כלים (6 בדיקות)
├── test_05_profile_management.py        # בדיקות פרופיל (7 בדיקות)
├── test_06_content_rating.py            # בדיקות דירוג (6 בדיקות)
│
├── screenshots/                          # צילומי מסך (נוצר אוטומטית)
├── test_files/                          # קבצי בדיקה (נוצר אוטומטית)
└── report.html                          # דוח HTML (נוצר אוטומטית)
```

---

## 🔧 פתרון בעיות נפוצות (Troubleshooting)

### 🔴 "ChromeDriver not found"
**פתרון:**
```bash
pip install --upgrade webdriver-manager
```
הספרייה תורид אוטומטית את ChromeDriver המתאים.

### 🔴 "Connection refused to localhost:5173"
**פתרון:**
1. ודא ש-Frontend רץ: `cd client && npm run dev`
2. בדוק שה-URL ב-`.env` נכון

### 🔴 "Connection refused to localhost:4000"
**פתרון:**
1. ודא ש-Backend רץ: `cd server && npm run dev`
2. בדוק שה-URL ב-`.env` נכון

### 🔴 "Element not found"
**פתרון:**
1. ה-UI עשוי להשתנות - בדוק את ה-selectors בקובץ הבדיקה
2. הגדל את זמני ההמתנה ב-`conftest.py`
3. הרץ במצב לא-headless כדי לראות מה קורה

### 🔴 "Test user doesn't exist"
**פתרון:**
```bash
cd server
npm run seed  # יצירת משתמשי בדיקה
```

### 🔴 בדיקות נכשלות באופן אקראי
**פתרון:**
1. בדוק חיבור רשת יציב
2. הגדל timeouts ב-`.env`
3. הפעל מחדש את שרתי האפליקציה

---

## 📊 הבנת התוצאות (Understanding Results)

### סימנים בפלט
- ✅ `.` - בדיקה עברה
- ❌ `F` - בדיקה נכשלה
- ⚠️ `s` - בדיקה דולגה
- `E` - שגיאה בביצוע הבדיקה

### דוגמת פלט מוצלח
```
test_01_user_authentication.py::TestUserAuthentication::test_03_user_login_success PASSED [100%]

======================== 1 passed in 5.23s ========================
```

### דוגמת פלט כשל
```
test_01_user_authentication.py::TestUserAuthentication::test_03_user_login_success FAILED [100%]

FAILED test_01_user_authentication.py::TestUserAuthentication::test_03_user_login_success - AssertionError: Login failed
Screenshot saved: screenshots/login_failure_20241231_120000.png
```

---

## 📸 צילומי מסך (Screenshots)

צילומי מסך נשמרים אוטומטית:
- **בכל נקודת ביקורת חשובה** במהלך הבדיקה
- **בכל כשל** של בדיקה
- **בתיקייה:** `screenshots/`

**שם קובץ:** `<test_name>_<timestamp>.png`

**דוגמה:** `login_success_20241231_120000.png`

---

## 🎬 זרימת עבודה מומלצת (Recommended Workflow)

### בפיתוח:
1. כתוב/שנה קוד
2. הרץ בדיקות רלוונטיות
3. תקן באגים
4. חזור על 1-3

```bash
# לדוגמה, אחרי שינוי בטופס התחברות:
pytest test_01_user_authentication.py -v
```

### לפני Commit:
```bash
# הרץ את כל הבדיקות
pytest -v

# אם הכל עבר, commit השינויים
git add .
git commit -m "Your message"
```

### ב-CI/CD:
```bash
# הבדיקות יורצו אוטומטית
# ראה azure-pipelines.yml
```

---

## 💡 טיפים שימושיים (Useful Tips)

### 1. הרצה מהירה של בדיקות smoke
```bash
pytest -m smoke -v
```

### 2. הרצת בדיקות קריטיות בלבד
```bash
pytest -m critical -v
```

### 3. דילוג על בדיקות איטיות
```bash
pytest -m "not slow" -v
```

### 4. הרצה מקבילית (מהיר יותר)
```bash
pip install pytest-xdist
pytest -n 4  # 4 workers
```

### 5. הצגת 10 הבדיקות האיטיות ביותר
```bash
pytest --durations=10
```

### 6. בדיקת syntax ללא הרצה
```bash
pytest --collect-only
```

---

## 📚 מסמכים נוספים (Additional Documentation)

- **[README.md](README.md)** - תיעוד מלא
- **[TEST_PLANNING.md](../TEST_PLANNING.md)** - תכנון הבדיקות
- **[BUG_TRACKING.md](../BUG_TRACKING.md)** - מעקב אחר באגים
- **[WIKI_TEST_SUMMARY.md](../WIKI_TEST_SUMMARY.md)** - סיכום בדיקות

---

## 🆘 צריך עזרה? (Need Help?)

1. **בדוק את צילומי המסך** ב-`screenshots/`
2. **קרא את הלוגים** בפלט של pytest
3. **ראה דוח HTML** אם יצרת אחד
4. **בדוק את התיעוד המלא** ב-README.md

---

## ✨ דוגמאות שימוש (Usage Examples)

### דוגמה 1: הרצה בסיסית
```bash
cd selenium-tests
pip install -r requirements.txt
pytest -v
```

### דוגמה 2: עם דוח ו-headless
```bash
export HEADLESS_MODE=true  # או הגדר ב-.env
pytest --html=report.html --self-contained-html
open report.html  # צפייה בדוח
```

### דוגמה 3: בדיקה ספציפית עם פלט מפורט
```bash
pytest test_01_user_authentication.py::TestUserAuthentication::test_03_user_login_success -v -s
```

### דוגמה 4: כל בדיקות האימות
```bash
pytest test_01_user_authentication.py -v
```

### דוגמה 5: רק בדיקות שנכשלו בפעם האחרונה
```bash
pytest --lf  # last-failed
```

---

## 🎯 סיכום (Summary)

**3 צעדים פשוטים:**
1. התקן dependencies: `pip install -r requirements.txt`
2. הפעל את האפליקציה (Frontend + Backend)
3. הרץ בדיקות: `pytest -v`

**זהו! אתה מוכן להתחיל! 🚀**

---

*עדכון אחרון: 31/12/2024*
