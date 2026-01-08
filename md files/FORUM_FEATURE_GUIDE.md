# Forum Questions Feature - Implementation Guide

## Overview
This document describes the implementation of the enhanced forum questions feature with image upload support and a rating system.

## Features

### 1. Question Creation with Images
Users can now create forum questions with:
- Title (10-150 characters)
- Detailed description (minimum 50 characters)
- Category selection (Computer Science, Mathematics, Physics, Chemistry, Study Resources, General)
- Course selection (required)
- Tags (1-5 tags)
- Image uploads (up to 5 images, 5MB each)
- Urgent flag (optional)

### 2. Rating System
- Users can rate questions from 1-5 stars
- Average rating displayed on question cards and detail pages
- One rating per user per question
- Rating count displayed
- Visual star interface for easy rating

### 3. Image Storage
- Images uploaded to Azure Blob Storage
- Fallback mechanism if Azure not configured
- Automatic image cleanup on question deletion
- Secure filename generation to prevent attacks

## Technical Implementation

### Database Schema

#### ForumPost Model
```prisma
model ForumPost {
  id         Int      @id @default(autoincrement())
  title      String
  content    String
  category   String?
  tags       String[] @default([])
  images     String[] @default([])
  isUrgent   Boolean  @default(false)
  views      Int      @default(0)
  isAnswered Boolean  @default(false)
  avgRating  Float?
  createdAt  DateTime @default(now())
  
  courseId   Int
  authorId   Int
  
  comments   ForumComment[]
  ratings    ForumRating[]
}
```

#### ForumRating Model
```prisma
model ForumRating {
  id        Int      @id @default(autoincrement())
  rating    Int      // 1-5
  createdAt DateTime @default(now())
  
  postId    Int
  userId    Int
  
  @@unique([postId, userId])
}
```

### API Endpoints

#### Create Question with Images
```
POST /api/forum
Content-Type: multipart/form-data
Authorization: Bearer <token>

Fields:
- title: string (required)
- content: string (required)
- courseId: number (required)
- category: string (optional)
- tags: JSON string array (optional)
- isUrgent: boolean (optional)
- images: File[] (optional, max 5)
```

#### Rate Question
```
POST /api/forum/:id/ratings
Content-Type: application/json
Authorization: Bearer <token>

Body:
{
  "rating": 1-5
}
```

#### Get Question Ratings
```
GET /api/forum/:id/ratings
Authorization: Bearer <token> (optional)

Response:
{
  "ratings": [...],
  "avgRating": 4.2,
  "userRating": 5,
  "totalRatings": 10
}
```

## Frontend Components

### NewQuestionPage
- Form for creating new questions
- Course selection dropdown
- Category radio buttons
- Tag input with suggestions
- Image upload with preview
- Real-time validation
- Loading states and error handling
- Redirects to question detail after success

### QuestionCard
- Displays question summary
- Shows rating with star icon
- Answer count with solved indicator
- View count
- Author information
- Tags display

### ForumPostDetailPage
- Full question display
- Image gallery
- Tags display
- Interactive star rating
- Comments/answers section
- User's current rating highlighted

## Configuration

### Environment Variables
```bash
# Azure Storage (Required for image uploads)
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
AZURE_STORAGE_CONTAINER_NAME=studyhub-files
```

### Supported Image Types
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### Limits
- Maximum 5 images per question
- Maximum 5MB per image
- Maximum 5 tags per question
- Title: 10-150 characters
- Content: minimum 50 characters

## Usage Examples

### Creating a Question with Images

```javascript
const formData = new FormData();
formData.append('title', 'How to implement bubble sort?');
formData.append('content', 'I am trying to implement bubble sort...');
formData.append('courseId', '1');
formData.append('category', 'computer-science');
formData.append('tags', JSON.stringify(['Python', 'Algorithms']));
formData.append('isUrgent', 'false');

// Add images
imageFiles.forEach(file => {
  formData.append('images', file);
});

const response = await api.post('/forum', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### Rating a Question

```javascript
const response = await api.post('/forum/123/ratings', {
  rating: 5
});

console.log('Average rating:', response.data.avgRating);
```

## Migration Guide

### Running the Migration

```bash
cd server
npx prisma migrate deploy
```

Or if the migration file exists:
```bash
cd server
npx prisma db push
```

### Updating Existing Code

1. **Frontend**: Import and use updated API
2. **Backend**: No changes needed to existing endpoints
3. **Database**: Run migration to add new fields

## Security Considerations

### Implemented Security Measures
1. ✅ Authentication required for all write operations
2. ✅ File type validation (images only)
3. ✅ File size limits (5MB per image)
4. ✅ Filename sanitization
5. ✅ Input validation on all fields
6. ✅ Unique constraint on ratings (one per user/post)
7. ✅ Azure Storage isolation

### Recommended Future Enhancements
1. Rate limiting on POST endpoints
2. Image malware scanning
3. Content moderation system
4. CAPTCHA for question creation

## Testing

### Manual Testing Checklist
- [ ] Create question without images
- [ ] Create question with 1 image
- [ ] Create question with 5 images
- [ ] Try to upload non-image file (should fail)
- [ ] Try to upload file > 5MB (should fail)
- [ ] Rate a question (1-5 stars)
- [ ] Try to rate same question twice (should update)
- [ ] View question with images
- [ ] View question ratings
- [ ] Delete question (should delete images)

### Automated Tests
See `server/tests/forum.test.js` for comprehensive test suite.

## Troubleshooting

### Images Not Uploading
1. Check Azure Storage configuration in .env
2. Verify AZURE_STORAGE_CONNECTION_STRING is set
3. Check container name matches AZURE_STORAGE_CONTAINER_NAME
4. Verify network access to Azure

### Ratings Not Saving
1. Check user is authenticated
2. Verify rating is between 1-5
3. Check database connection
4. Verify ForumRating model exists in database

### Questions Not Displaying
1. Check API endpoint is accessible
2. Verify CORS configuration
3. Check browser console for errors
4. Verify database has ForumPost records

## Support
For issues or questions, please create a GitHub issue or contact the development team.
