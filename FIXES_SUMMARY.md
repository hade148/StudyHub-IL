# Summary Upload and Authentication Fixes

## Issues Fixed

### 1. POST /api/summaries 400 Error (Summary Upload Failure)

**Problem:**
When attempting to upload a summary file, the request was failing with a 400 Bad Request error. The terminal showed:
```
POST /api/summaries 400 13.136 ms - 42
```

**Root Cause:**
The validation middleware expected `courseId` to be an integer type, but FormData sends all fields as strings. The validator `isInt()` was rejecting the string value even though it contained a valid integer.

**Solution:**
Modified the validation in `server/src/middleware/validation.js` to accept string values and validate them as parseable integers:

```javascript
body('courseId')
  .notEmpty().withMessage('קורס הוא שדה חובה')
  .custom((value) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) {
      throw new Error('מזהה קורס לא תקין');
    }
    return true;
  }),
```

This allows the validation to accept string values from FormData and properly validate that they can be converted to valid positive integers.

### 2. GET /api/auth/me 500 Error (Authentication Endpoint Failure)

**Problem:**
The `/api/auth/me` endpoint was consistently returning 500 Internal Server Error:
```
GET /api/auth/me 500 428.773 ms - 55
```

**Root Causes:**
1. Missing database configuration (.env file not present)
2. PostgreSQL service not running
3. Insufficient error handling in the authentication middleware

**Solutions:**

#### a. Database Configuration
Created `.env` file in the server directory with proper database configuration:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/studyhub_db?schema=public"
JWT_SECRET="dev-secret-key-for-testing-only-change-in-production"
CLIENT_URL="http://localhost:3000"
```

#### b. Database Setup
- Started PostgreSQL service
- Created the `studyhub_db` database
- Ran Prisma migrations to set up the schema
- Seeded the database with test data

#### c. Enhanced Error Handling
Improved error handling in `server/src/middleware/auth.js`:
```javascript
catch (error) {
  console.error('Authentication error:', error);
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'טוקן לא תקין' });
  }
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'הטוקן פג תוקף' });
  }
  if (error.name === 'PrismaClientKnownRequestError' || error.name === 'PrismaClientUnknownRequestError') {
    return res.status(500).json({ error: 'שגיאת מסד נתונים' });
  }
  return res.status(500).json({ error: 'שגיאת אימות' });
}
```

Also improved error handling in `server/src/routes/auth.js` for the `/me` endpoint:
```javascript
if (!user) {
  return res.status(404).json({ error: 'משתמש לא נמצא' });
}
```

## Verification

All endpoints are now working correctly:

### Authentication
```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@studyhub.local","password":"password123"}'

# Response: 200 OK with token

# Get current user
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <token>"

# Response: 200 OK with user data
```

### Summary Upload
```bash
curl -X POST http://localhost:4000/api/summaries \
  -H "Authorization: Bearer <token>" \
  -F "file=@test.pdf" \
  -F "title=סיכום בדיקה" \
  -F "courseId=1" \
  -F "description=תיאור הסיכום"

# Response: 201 Created with summary data
```

## Server Logs (No Errors)
```
POST /api/auth/login 200 114.240 ms - 303
GET /api/auth/me 200 51.694 ms - 271
GET /api/courses 200 41.255 ms - 687
POST /api/summaries 201 44.688 ms - 541
```

## Files Modified

1. `server/src/middleware/validation.js` - Fixed courseId validation
2. `server/src/middleware/auth.js` - Enhanced error handling
3. `server/src/routes/auth.js` - Improved error handling for /me endpoint
4. `server/.env` - Created with proper configuration (not committed to git, already in .gitignore)

## Google Drive Integration

The upload system supports Google Drive storage when configured. To enable:

1. Set up a Google Cloud Service Account
2. Add credentials to `.env`:
   ```env
   GOOGLE_DRIVE_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
   GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_DRIVE_FOLDER_ID="your-folder-id" # Optional
   ```

When not configured, files are stored locally in the `server/uploads/` directory.

## Testing Instructions

1. Start PostgreSQL: `sudo systemctl start postgresql`
2. Install dependencies: `cd server && npm install`
3. Set up database: `npx prisma db push`
4. Seed database: `npm run seed`
5. Start server: `npm start`
6. Start client: `cd ../client && npm run dev`
7. Access app at: http://localhost:3000
8. Login with: `student@studyhub.local` / `password123`
9. Navigate to upload page and test file upload

## Notes

- The `.env` file contains development credentials and should not be committed to the repository
- The fixes ensure proper FormData handling for file uploads
- Error messages are now more descriptive for debugging
- All Hebrew error messages are preserved
