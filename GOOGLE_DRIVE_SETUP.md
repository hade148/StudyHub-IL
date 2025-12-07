# Google Drive Integration Setup

This document explains how the Google Drive integration works for file uploads in StudyHub-IL.

## Overview

StudyHub-IL now supports uploading summary files (PDF and DOCX) to Google Drive for storage. When configured, files are automatically uploaded to Google Drive, making them accessible via web links.

## Configuration

### Required Environment Variables

Add these to your `server/.env` file:

```bash
# Google Drive Configuration (for summary file storage)
GOOGLE_DRIVE_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID="your-folder-id"  # Optional - uploads to root if not specified
```

### Setting up Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API
4. Create a Service Account:
   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Give it a name and description
   - Grant it the necessary permissions
5. Create a key for the service account:
   - Click on the service account
   - Go to "Keys" tab
   - Add Key > Create new key > JSON
   - Download the JSON file
6. Extract the credentials:
   - `client_email` → `GOOGLE_DRIVE_CLIENT_EMAIL`
   - `private_key` → `GOOGLE_DRIVE_PRIVATE_KEY`

### Google Drive Folder Setup

1. Create a folder in Google Drive where files will be uploaded
2. Share the folder with your service account email (the `client_email` from step 5)
3. Give it "Editor" permissions
4. Get the folder ID from the URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
5. Use this as `GOOGLE_DRIVE_FOLDER_ID`

## Features

### Supported File Types

- PDF (`.pdf`) - `application/pdf`
- DOCX (`.docx`) - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

Maximum file size: 10MB

### Upload Flow

1. User selects a PDF or DOCX file
2. File is temporarily stored on the server
3. If Google Drive is configured:
   - File is uploaded to Google Drive
   - Google Drive returns a file ID and web view link
   - Temporary file is deleted
   - Database stores the web view link
4. If Google Drive is not configured or upload fails:
   - File is moved to permanent local storage
   - Database stores the local file path

### Download Flow

1. User clicks "Download" button on summary detail page
2. If file is on Google Drive (URL starts with http/https):
   - Opens the file in a new tab via Google Drive viewer
3. If file is stored locally:
   - Downloads via secure `/api/summaries/:id/download` endpoint
   - Prevents path traversal attacks by using summary ID

### Fallback Behavior

If Google Drive upload fails (network issues, quota exceeded, etc.):
- The system automatically falls back to local storage
- Error is logged but user upload still succeeds
- This ensures upload reliability

## Testing

To verify Google Drive configuration:

```javascript
const { isDriveConfigured } = require('./src/utils/googleDrive');
console.log('Google Drive configured:', isDriveConfigured());
```

## Security Considerations

1. **Service Account Security**: Never commit the `.env` file or private keys to version control
2. **File Permissions**: Files uploaded to Google Drive are made public with "anyone with link" access
3. **Download Endpoint**: Uses summary ID instead of file path to prevent path traversal
4. **Authentication**: Download endpoint requires user authentication

## Troubleshooting

### "Google Drive not configured" Error

- Check that all required environment variables are set
- Verify the private key format (should include `\n` for newlines)
- Ensure the service account JSON was downloaded correctly

### Authentication Errors ("No key or keyFile set")

If you see authentication errors like "No key or keyFile set" or "Failed to load service account from JSON":

- This was fixed in version 2.0 by updating the JWT initialization
- Make sure you're using googleapis v167+ with the new options object format
- The code now properly handles the private key with the new API

### Upload Fails but Works Locally

- Check that the service account has access to the Google Drive folder
- Verify the folder ID is correct
- Ensure Google Drive API is enabled in your Google Cloud project
- Check API quota limits
- Review server logs for detailed error messages

### Files Not Accessible

- Verify that permissions were set correctly on uploaded files
- Check that the folder is shared with the service account
- Ensure the web view link is being stored in the database

### Server Startup Checks

When the server starts, it will display the Google Drive configuration status:
- `☁️ Google Drive: Configured` - Files will be uploaded to Google Drive
- `💾 Google Drive: Not configured` - Files will be stored locally

## Code References

- Google Drive utilities: `server/src/utils/googleDrive.js`
- Upload endpoint: `server/src/routes/summaries.js` (POST `/api/summaries`)
- Download endpoint: `server/src/routes/summaries.js` (GET `/api/summaries/:id/download`)
- Upload UI: `client/src/components/summaries/UploadPage.tsx`
- Detail page: `client/src/components/summaries/SummaryDetailPage.tsx`
