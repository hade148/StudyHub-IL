# ניקוי מסד הנתונים מנתונים מזויפים

הנתונים המזויפים שאתה רואה ב-UI (סיכומים ושאלות של "יוסי כהן") נמצאים במסד הנתונים ולא בקוד ה-UI.

## איך לנקות את מסד הנתונים:

### אופציה 1: איפוס מלא של מסד הנתונים (מומלץ)

```bash
cd server
npx prisma migrate reset
```

פקודה זו תעשה:
1. מחיקה מלאה של כל הנתונים במסד
2. הרצה מחדש של כל ה-migrations
3. הרצת ה-seed (יצירת משתמש admin בלבד)

**תוצאה:** מסד נתונים נקי עם משתמש admin אחד בלבד.

### אופציה 2: מחיקה ידנית של נתונים ספציפיים

אם אתה רוצה לשמור נתונים מסוימים, תוכל להתחבר למסד ולמחוק ידנית:

```bash
cd server
npx prisma studio
```

ואז:
1. פתח את הטבלה `Summary` - מחק את הסיכומים המזויפים
2. פתח את הטבלה `ForumQuestion` - מחק את השאלות המזויפות
3. פתח את הטבלה `User` - מחק את המשתמשים המזויפים (שמור רק את ה-admin)

### אופציה 3: מחיקה באמצעות SQL

```sql
-- מחיקת כל הסיכומים
DELETE FROM "Summary";

-- מחיקת כל שאלות הפורום
DELETE FROM "ForumQuestion";

-- מחיקת כל המשתמשים מלבד admin
DELETE FROM "User" WHERE email != 'admin@studyhub.local';

-- מחיקת כל הכלים
DELETE FROM "Tool";

-- איפוס counters
ALTER SEQUENCE "Summary_id_seq" RESTART WITH 1;
ALTER SEQUENCE "ForumQuestion_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Tool_id_seq" RESTART WITH 1;
```

## משתמש Admin

אחרי הניקוי, תוכל להתחבר עם:
- **Email:** admin@studyhub.local
- **Password:** password123

## שים לב

לאחר ניקוי מסד הנתונים:
- ✅ ה-UI יציג empty states נקיים
- ✅ המערכת מוכנה לנתונים אמיתיים
- ✅ המשתמשים יצטרכו להירשם מחדש
- ✅ כל התוכן (סיכומים, שאלות, כלים) יימחק

## הרצה מהירה

```bash
cd server
npx prisma migrate reset --force
```

הדגל `--force` מדלג על אישור ומבצע את הניקוי באופן מיידי.
