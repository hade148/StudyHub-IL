# Testing Guide for Azure Blob Storage Integration

This guide provides step-by-step instructions to test the Azure Blob Storage integration for file uploads.

## Prerequisites

1. **Azure Storage Account Setup**
   - Storage Account: `studyhubil`
   - Container: `studyhub-files`
   - Connection String available

2. **Environment Setup**
   - Node.js v18+ installed
   - PostgreSQL database running
   - Azure credentials configured in `.env`

## Setup Instructions

### 1. Configure Environment Variables

Create or update `server/.env` with:

```env
# Database (ensure this is configured)
DATABASE_URL="postgresql://username:password@localhost:5432/studyhub_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=4000
NODE_ENV=development

# Client URL
CLIENT_URL="http://localhost:5173"

# Email Configuration (optional for testing)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Azure Storage (REQUIRED)
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=studyhubil;AccountKey=i7kat5GXWjUJD5keJlWxPHATHU2Oa2KLPhfo+9XJQXYIlm87lGOIPVjtHZDaeNvNuMu8TpmrEeob+AStCVUxNA==;EndpointSuffix=core.windows.net"
AZURE_STORAGE_CONTAINER_NAME="studyhub-files"
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Setup Database

```bash
cd server

# Generate Prisma client
npx prisma generate

# Run migrations (if needed)
npx prisma migrate dev

# Seed database with test data
npm run seed
```

### 4. Start the Application

**Terminal 1 - Start Server:**
```bash
cd server
npm run dev
```

Server should start on http://localhost:4000

**Terminal 2 - Start Client:**
```bash
cd client
npm run dev
```

Client should start on http://localhost:5173

## Test Cases

### Test 1: Verify Azure Connection

1. Check server logs when starting the server
2. Look for: `✅ Azure Blob Storage initialized successfully`
3. If you see an error, verify your connection string

**Expected:** Green checkmark message in console

### Test 2: User Authentication

1. Navigate to http://localhost:5173
2. Login with test credentials:
   - Email: `student@studyhub.local`
   - Password: `password123`

**Expected:** Successful login, redirected to dashboard

### Test 3: Upload PDF File

1. Navigate to "סיכומים" (Summaries) page
2. Click "העלה סיכום" (Upload Summary) button
3. **Step 1 - File Upload:**
   - Drag and drop a PDF file OR click to select
   - Verify file size is under 10MB
   - Check that file preview appears
4. **Step 2 - Summary Details:**
   - Enter title: "בדיקת העלאה - PDF"
   - Select a course from dropdown (courses should load dynamically)
   - Enter description (optional): "זהו קובץ בדיקה"
5. **Step 3 - Tags and Category:**
   - Select a category (e.g., מדעי המחשב)
   - Add at least one tag
6. **Step 4 - Preview:**
   - Review all details
   - Check "אני מאשר/ת..." checkbox
   - Click "פרסם סיכום" (Publish Summary)

**Expected Results:**
- Success modal appears
- Server logs show: `✅ File uploaded to Azure: summary-[timestamp].pdf`
- No errors in browser console
- File uploaded to Azure Blob Storage

### Test 4: Upload DOCX File

Repeat Test 3 but with a DOCX file instead of PDF

**Expected:** Same success as PDF upload

### Test 5: File Validation - Size Limit

1. Try uploading a file larger than 10MB

**Expected:** 
- Client shows alert: "הקובץ גדול מדי. גודל מקסימלי: 10MB"
- File not uploaded

### Test 6: File Validation - Type

1. Try uploading a file that's not PDF or DOCX (e.g., .txt, .jpg)

**Expected:**
- Client shows alert: "סוג קובץ לא נתמך. אנא העלה PDF או DOCX"
- File not uploaded

### Test 7: View Summary

1. Navigate to summaries list
2. Find your uploaded summary
3. Click on it to view details

**Expected:**
- Summary details page loads
- Title, description, and metadata displayed correctly
- Download button visible

### Test 8: Download File

1. On summary details page, click "הורדה" (Download) button

**Expected:**
- New browser tab opens with the file
- File downloads or displays in browser
- URL should be an Azure blob URL (https://studyhubil.blob.core.windows.net/...)

**Check in Azure Portal:**
- Go to Azure Storage Account
- Navigate to Containers > studyhub-files
- Verify the file exists there

### Test 9: Delete Summary

1. On summary details page
2. If delete button is visible (owner or admin only)
3. Click delete and confirm

**Expected:**
- Summary deleted from database
- Server logs show: `✅ File deleted from Azure: [filename]`
- File removed from Azure Storage (verify in portal)
- Redirected back to summaries list

### Test 10: Multiple Uploads

1. Upload 3-5 different summaries
2. Verify each appears in the list
3. Verify each can be downloaded

**Expected:**
- All summaries upload successfully
- All files stored in Azure with unique names
- All downloads work correctly

### Test 11: Fallback to Local Storage (Optional)

1. Stop the server
2. Remove or comment out `AZURE_STORAGE_CONNECTION_STRING` in `.env`
3. Restart the server
4. Try uploading a file

**Expected:**
- Server logs show: `⚠️ Azure not configured, saved locally: uploads/[filename]`
- File saved to `server/uploads/` directory
- Upload and download still work (from local storage)

## Verification Checklist

- [ ] Azure connection initializes successfully
- [ ] User can login
- [ ] User can upload PDF files
- [ ] User can upload DOCX files
- [ ] File size validation works (rejects >10MB)
- [ ] File type validation works (rejects non-PDF/DOCX)
- [ ] Uploaded files appear in summaries list
- [ ] Download button works correctly
- [ ] Files download from Azure blob URLs
- [ ] Files visible in Azure Portal
- [ ] Delete functionality removes files from Azure
- [ ] Multiple files can be uploaded
- [ ] No console errors during any operation
- [ ] UI shows appropriate loading states
- [ ] Error messages are user-friendly

## Azure Portal Verification

1. Login to Azure Portal
2. Navigate to Storage Accounts > studyhubil
3. Go to Containers > studyhub-files
4. Verify uploaded files are present
5. Check file names match pattern: `summary-[timestamp]-[random].pdf`
6. Click on a file to view properties
7. Verify "Blob Public Access Level" allows downloads

## Troubleshooting

### "Azure Storage is not configured" Error
- Check connection string in `.env`
- Verify no typos in variable name
- Restart server after changing `.env`

### "Failed to upload file to Azure Storage" Error
- Verify Azure Storage account is active
- Check container exists and name is correct
- Verify connection string has correct permissions
- Check internet connection

### Files Not Appearing in Azure Portal
- Verify upload completed successfully (check server logs)
- Refresh the Azure Portal page
- Check you're looking at the correct container

### Download Returns 404
- Verify file exists in Azure
- Check container public access is set to "Blob"
- Verify blob URL is correct

### "Cannot read properties of undefined" in Browser
- Check all required fields are filled
- Verify courses are loading (check network tab)
- Check authentication token is valid

## Performance Testing

### Test Upload Time
1. Upload a 5MB PDF file
2. Measure time from submit to success modal
3. Typical time: 3-5 seconds

### Test Download Speed
1. Click download button
2. Measure time to file open
3. Should be near-instant (Azure CDN)

## Security Testing

### Test Authentication
1. Try accessing upload page without login
2. Should redirect to login

### Test Authorization
1. Try deleting someone else's summary
2. Should show "אין לך הרשאה" error

### Test File Injection
1. Try uploading executable files (.exe, .sh)
2. Should be rejected by validation

## Success Criteria

All tests pass with:
- ✅ No errors in server logs
- ✅ No errors in browser console
- ✅ All files stored in Azure
- ✅ All downloads work correctly
- ✅ Proper validation and error handling
- ✅ Good user experience (loading states, success messages)

## Reporting Issues

If any test fails, note:
1. Which test case failed
2. Error messages (server and client)
3. Browser console logs
4. Network tab information (if relevant)
5. Screenshots of the issue
6. Steps to reproduce

## Next Steps After Testing

Once all tests pass:
1. Test in production environment
2. Monitor Azure storage usage
3. Set up alerts for storage quota
4. Consider adding rate limiting
5. Implement additional file types if needed
6. Add file preview functionality
7. Consider adding virus scanning
