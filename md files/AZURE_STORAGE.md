# Azure Blob Storage Integration

This document explains the Azure Blob Storage integration for file uploads in StudyHub-IL.

## Overview

StudyHub-IL now uses **Azure Blob Storage** to store uploaded summary files (PDFs and DOCX files) in the cloud instead of storing them locally on the server. This provides better scalability, reliability, and easier file management.

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file in the `server` directory:

```env
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=studyhubil;AccountKey=YOUR_KEY_HERE;EndpointSuffix=core.windows.net"
AZURE_STORAGE_CONTAINER_NAME="studyhub-files"
```

**Important:** Never commit the `.env` file to version control. It's already included in `.gitignore`.

### Azure Storage Account Setup

1. **Storage Account:** `studyhubil`
2. **Container Name:** `studyhub-files`
3. **Access Level:** Blob (anonymous read access for blobs)
4. **Redundancy:** LRS (Locally-redundant storage)

## Features

### File Upload
- Supports PDF and DOCX files
- Maximum file size: 10MB
- Files are uploaded to Azure Blob Storage
- Fallback to local storage if Azure is not configured

### File Download
- Direct download from Azure Blob Storage via public URL
- Downloads work without authentication

### File Deletion
- Automatically deletes files from Azure when a summary is deleted
- Handles both Azure and local storage cleanup

## Implementation Details

### Backend (`server/src/utils/azureStorage.js`)

The `AzureStorageService` class handles all Azure Blob Storage operations:

- `uploadFile(fileBuffer, fileName, contentType)` - Upload a file to Azure
- `deleteFile(fileName)` - Delete a file from Azure
- `getFileUrl(fileName)` - Get the public URL for a file
- `extractBlobName(urlOrPath)` - Extract blob name from URL or path

### API Endpoints

#### Upload Summary
```
POST /api/summaries
Content-Type: multipart/form-data

Fields:
- file: PDF or DOCX file
- title: Summary title (required, min 3 characters)
- courseId: Course ID (required, integer)
- description: Optional description
```

#### Download Summary
```
GET /api/summaries/:id/download

Returns:
{
  "downloadUrl": "https://studyhubil.blob.core.windows.net/studyhub-files/summary-123456.pdf",
  "fileName": "Summary Title"
}
```

#### Delete Summary
```
DELETE /api/summaries/:id

Requires authentication and ownership/admin role
```

### Frontend Integration

#### Upload Page (`client/src/components/summaries/UploadPage.tsx`)
- Fetches courses dynamically from API
- Validates file type (PDF/DOCX) and size (max 10MB)
- Submits file with metadata to backend
- Shows success modal after upload

#### Summary Detail Page (`client/src/components/summaries/SummaryDetailPage.tsx`)
- Downloads files via Azure Blob Storage URL
- Opens files in new browser tab

## File Storage Structure

```
Azure Storage Account: studyhubil
  └── Container: studyhub-files
       ├── summary-1234567890-123456789.pdf
       ├── summary-1234567891-987654321.docx
       └── ...
```

Each file is named with a unique timestamp-based identifier to prevent conflicts.

## Fallback Behavior

If Azure Blob Storage is not configured (no connection string in `.env`):
- Files are stored locally in `server/uploads/` directory
- Downloads serve files from local storage
- All operations fall back gracefully

## Benefits

✅ **Scalability:** No need to manage server disk space  
✅ **Reliability:** 3 copies of each file (LRS)  
✅ **Performance:** Direct downloads from Azure CDN  
✅ **Security:** Connection string stored securely in environment variables  
✅ **Cost-Effective:** 5GB free with Azure for Students  

## Security Considerations

1. **Connection String:** Never expose in code or commit to Git
2. **Container Access:** Set to "Blob" level (anonymous read for individual blobs only)
3. **File Validation:** Server validates file types and sizes before upload
4. **Authentication:** Upload requires user authentication
5. **Authorization:** Only file owner or admin can delete files

## Troubleshooting

### Upload Fails
- Check Azure connection string is correct in `.env`
- Verify Azure Storage account is active
- Check container name matches configuration
- Ensure file size is under 10MB

### Download Doesn't Work
- Verify container has "Blob" level anonymous access
- Check file exists in Azure Storage
- Ensure URL is not expired (Azure URLs are permanent unless file is deleted)

### Files Not Deleting
- Check user has permission (owner or admin)
- Verify file exists in database and Azure
- Check Azure connection is active

## Testing

To test the Azure integration:

1. Set up Azure credentials in `.env`
2. Start the server: `cd server && npm run dev`
3. Start the client: `cd client && npm run dev`
4. Navigate to Upload page
5. Upload a PDF or DOCX file
6. Verify file appears in summaries list
7. Test download functionality
8. Test delete functionality (if you're the owner)

## Migration from Local Storage

If you have existing files in `server/uploads/`:
1. Files will continue to work (backend supports both)
2. New uploads will use Azure
3. Old files can be migrated manually to Azure if needed

## Costs

With Azure for Students:
- 5GB storage (free)
- Bandwidth included
- No charges for first 5GB of data

Monitor usage in Azure Portal to stay within free tier limits.
