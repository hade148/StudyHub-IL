# Upload Feature Troubleshooting Guide

## Overview
This guide helps diagnose and fix issues with the summary upload feature in StudyHub-IL.

## Common Issues and Solutions

### 1. 400 Bad Request Error

**Symptoms:**
- Error message: `POST /api/summaries 400`
- Error in browser console: `Upload failed: AxiosError`

**Possible Causes and Solutions:**

#### A. Server Not Running
**Check:** Is the backend server running?
```bash
cd server
npm run dev
```

The server should start on port 4000 (or as configured in `.env`).

#### B. Database Not Set Up
**Check:** Is PostgreSQL running and the database created?

```bash
# Check if PostgreSQL is running (Linux/Mac)
sudo systemctl status postgresql

# Or (Windows)
Get-Service postgresql*

# Create database if not exists
psql -U postgres -c "CREATE DATABASE studyhub_db;"

# Run migrations
cd server
npx prisma migrate dev
```

#### C. Missing Environment Variables
**Check:** Does `server/.env` file exist with correct configuration?

```bash
cd server
cat .env
```

If the file doesn't exist, create it from the example:
```bash
cp .env.example .env
```

Then edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/studyhub_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
CLIENT_URL="http://localhost:3000"

# Optional: Google Drive configuration
GOOGLE_DRIVE_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID="your-folder-id"
```

#### D. No Courses in Database
**Check:** Are there courses available for selection?

```bash
cd server
npm run seed
```

Or manually add a course via psql:
```sql
INSERT INTO courses (course_code, course_name, institution, semester, created_at)
VALUES ('CS101', 'מבוא למדעי המחשב', 'אוניברסיטה', 'סמסטר א', NOW());
```

#### E. Not Authenticated
**Check:** Are you logged in?

The upload feature requires authentication. Make sure you:
1. Register an account or login
2. The token is stored in localStorage
3. The Authorization header is being sent with requests

You can check in browser DevTools:
```javascript
// In browser console
localStorage.getItem('token')
```

### 2. 500 Internal Server Error

**Symptoms:**
- Error message: `api/auth/me:1 Failed to load resource: the server responded with a status of 500`

**Solutions:**

#### A. Database Connection Failed
Check your `DATABASE_URL` in `.env` is correct and PostgreSQL is running.

```bash
# Test database connection
psql -U postgres -d studyhub_db -c "SELECT 1;"
```

#### B. Prisma Client Not Generated
```bash
cd server
npx prisma generate
```

### 3. File Not Appearing in UI After Upload

**Symptoms:**
- Upload succeeds but the summary doesn't appear in the summaries list

**Solution:**
The SummariesPage now fetches data from the API. If the upload succeeded but the summary doesn't appear:

1. **Refresh the page** - The list may need to be reloaded
2. **Check the database** - Verify the summary was actually saved:
```sql
SELECT * FROM summaries ORDER BY upload_date DESC LIMIT 5;
```
3. **Check browser console** - Look for errors when fetching summaries

### 4. Google Drive Upload Issues

**Symptoms:**
- Upload succeeds but file is saved locally instead of Google Drive
- Console shows: `Google Drive upload failed`

**Solutions:**

#### A. Google Drive Not Configured
This is normal! If Google Drive credentials are not configured, files will be saved locally in `server/uploads/` directory. This is by design as a fallback.

To enable Google Drive:
1. Follow the instructions in [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md)
2. Add credentials to `server/.env`
3. Restart the server

#### B. Invalid Credentials
Check your Google Drive configuration:
- Verify the service account email is correct
- Verify the private key is properly formatted (includes `\n` for newlines)
- Ensure the service account has permission to access the target folder

#### C. Folder ID Issues
If files aren't appearing in the expected folder:
- Verify `GOOGLE_DRIVE_FOLDER_ID` in `.env`
- Check the service account has write access to the folder
- Try removing the folder ID to upload to root

### 5. React Warnings in Console

**Symptoms:**
- `Warning: Function components cannot be given refs`
- `React Router Future Flag Warning`

**Status:** These warnings have been fixed in the latest version:
- Textarea component now uses `React.forwardRef()`
- BrowserRouter includes v7 future flags

If you still see these warnings, make sure you have the latest code:
```bash
git pull origin main
cd client
npm install
```

## Debugging Steps

### 1. Check Server Logs
```bash
cd server
npm run dev
```

Look for error messages in the terminal when you try to upload.

### 2. Check Browser Console
Open browser DevTools (F12) and look at:
- **Console tab**: JavaScript errors
- **Network tab**: Failed requests with details
  - Click on the failed request
  - Check "Response" tab for server error message
  - Check "Headers" tab to verify Authorization header is sent

### 3. Verify Request Data
In browser console, check what data is being sent:
```javascript
// Add this temporarily in UploadPage.tsx before api.post
console.log('FormData contents:');
for (let [key, value] of formData.entries()) {
  console.log(key, value);
}
```

### 4. Test Backend Directly
Use curl or Postman to test the endpoint:

```bash
# First, login to get a token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@studyhub.local","password":"password123"}'

# Then upload a file (replace TOKEN with actual token)
curl -X POST http://localhost:4000/api/summaries \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@test.pdf" \
  -F "title=Test Summary" \
  -F "courseId=1" \
  -F "description=Test description"
```

## Quick Setup Script

For a fresh installation, run these commands:

```bash
# Backend setup
cd server
npm install
cp .env.example .env
# Edit .env with your database credentials
nano .env
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev &

# Frontend setup (in another terminal)
cd client
npm install
npm run dev
```

## Verification Checklist

- [ ] PostgreSQL is running
- [ ] Database `studyhub_db` exists
- [ ] Server `.env` file exists with correct DATABASE_URL
- [ ] Prisma migrations have been run
- [ ] Database has at least one course
- [ ] Backend server is running on port 4000
- [ ] Frontend is running on port 3000/5173
- [ ] You are logged in (token in localStorage)
- [ ] No errors in server terminal
- [ ] No errors in browser console (except warnings we know about)

## Getting Help

If you're still experiencing issues:

1. **Check the logs**: Look at both server terminal and browser console
2. **Verify the checklist**: Make sure all items above are checked
3. **Check recent commits**: The issue might be fixed in latest code
4. **Review error message**: The validation errors now show detailed information

## Related Files

- `client/src/components/summaries/UploadPage.tsx` - Upload UI component
- `server/src/routes/summaries.js` - Upload API endpoint
- `server/src/middleware/validation.js` - Request validation
- `server/src/utils/googleDrive.js` - Google Drive integration
- `FIXES_SUMMARY.md` - Previous fixes applied
- `GOOGLE_DRIVE_SETUP.md` - Google Drive setup guide
