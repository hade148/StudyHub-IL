# Profile Avatar Upload Implementation

## Overview
This document describes the implementation of profile editing with avatar upload functionality using Azure Blob Storage.

## Changes Made

### Backend Changes

#### 1. Database Schema (`server/prisma/schema.prisma`)
- Added `avatar` field to User model (nullable String)
- Migration file created: `20251209201723_add_user_avatar/migration.sql`

#### 2. Auth Routes (`server/src/routes/auth.js`)
- Added multer configuration for avatar uploads (5MB limit, image files only)
- Created new endpoint: `POST /api/auth/profile/avatar`
  - Accepts multipart/form-data with `avatar` field
  - Uploads to Azure Blob Storage (or local storage if Azure is not configured)
  - Deletes old avatar before uploading new one
  - Returns updated user object with new avatar URL
- Updated existing endpoints to include `avatar` field:
  - `GET /api/auth/me`
  - `POST /api/auth/login`
  - `PUT /api/auth/profile`

#### 3. Tests (`server/tests/auth.test.js`)
- Added comprehensive tests for avatar upload endpoint:
  - Test file upload with valid image
  - Test rejection of non-image files
  - Test rejection without file
  - Test authentication requirement

### Frontend Changes

#### 1. Auth Context (`client/src/context/AuthContext.tsx`)
- Added `avatar` field to User interface
- Added `uploadAvatar` function to upload avatar files
- Updates localStorage and context state after upload

#### 2. Edit Profile Modal (`client/src/components/profile/EditProfileModal.tsx`)
- Added file input for avatar upload
- Added avatar preview functionality
- Shows loading state during upload
- Calls `onAvatarUpload` prop when user selects an image
- Validates file type (images only) and size (5MB max)

#### 3. Profile Page (`client/src/components/profile/ProfilePageNew.tsx`)
- Updated to use avatar from user data (instead of static data)
- Added `handleAvatarUpload` function
- Passes `uploadAvatar` to EditProfileModal

## Setup Instructions

### Prerequisites
1. Ensure Azure Blob Storage is configured with environment variables:
   - `AZURE_STORAGE_CONNECTION_STRING`
   - `AZURE_STORAGE_CONTAINER_NAME`
   
   If Azure is not configured, files will be stored locally in `server/uploads/avatars/`

### Database Migration
Run the following command to apply the database migration:
```bash
cd server
npx prisma migrate deploy
```

Or for development:
```bash
npx prisma migrate dev
```

### Running the Application

1. Start the backend server:
```bash
cd server
npm install
npm run dev
```

2. Start the frontend client:
```bash
cd client
npm install
npm run dev
```

## Testing

### Manual Testing
1. Login to the application
2. Navigate to your profile page
3. Click "ערוך פרופיל" (Edit Profile) button
4. Click on the avatar or "העלה תמונה חדשה" button
5. Select an image file (JPG, PNG, or WEBP)
6. The avatar should upload immediately and show a preview
7. The new avatar should appear in the profile header
8. Logout and login again - the avatar should persist

### Automated Tests
Run the test suite (requires DATABASE_URL environment variable):
```bash
cd server
npm test
```

## API Documentation

### Upload Avatar
**Endpoint:** `POST /api/auth/profile/avatar`

**Authentication:** Required (Bearer token)

**Content-Type:** `multipart/form-data`

**Request Body:**
- `avatar`: Image file (JPG, PNG, WEBP, max 5MB)

**Response:**
```json
{
  "message": "תמונת הפרופיל עודכנה בהצלחה",
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "avatar": "https://[storage-account].blob.core.windows.net/[container]/avatars/1_1234567890.png",
    ...
  },
  "avatarUrl": "https://[storage-account].blob.core.windows.net/[container]/avatars/1_1234567890.png"
}
```

**Error Responses:**
- `400`: No file uploaded or invalid file type
- `401`: Not authenticated
- `500`: Server error or Azure upload failure

## Azure Storage Structure
Avatars are stored in the following structure:
```
[container-name]/
  └── avatars/
      ├── 1_1234567890.png
      ├── 2_1234567891.jpg
      └── ...
```

Filename format: `{userId}_{timestamp}.{extension}`

## Features
- ✅ Profile editing with text fields (name, bio, location, institution, etc.)
- ✅ Avatar upload with preview
- ✅ Azure Blob Storage integration with local fallback
- ✅ Image validation (type and size)
- ✅ Automatic deletion of old avatars
- ✅ Immediate UI update after upload
- ✅ Avatar persistence across sessions
- ✅ Comprehensive error handling

## Security Considerations
- File type validation (only images allowed)
- File size limit (5MB)
- Authentication required for uploads
- User can only update their own avatar
- Old avatar files are cleaned up to prevent storage bloat

## Future Enhancements
- Image cropping/resizing on upload
- Multiple profile picture support (cover photos)
- Avatar deletion endpoint
- Image optimization before upload
- Progress indicator for large uploads
