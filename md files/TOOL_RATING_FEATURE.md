# Tool Rating Feature Documentation

## Overview
This document describes the implementation of the rating feature for tools in the StudyHub-IL platform. This feature allows users to rate educational tools with a 1-5 star rating system, similar to the existing rating functionality for summaries and forum posts.

## Features Implemented

### 1. Database Schema Updates

#### New Model: ToolRating
```prisma
model ToolRating {
  id        Int      @id @default(autoincrement())
  rating    Int      // 1-5
  createdAt DateTime @default(now())
  
  toolId    Int
  tool      Tool     @relation(fields: [toolId], references: [id], onDelete: Cascade)
  
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([toolId, userId])
  @@map("tool_ratings")
}
```

#### Updated Tool Model
```prisma
model Tool {
  id          Int      @id @default(autoincrement())
  title       String
  url         String
  description String?
  category    String?
  avgRating   Float?   // NEW: Average rating field
  createdAt   DateTime @default(now())
  
  addedById   Int
  addedBy     User     @relation(fields: [addedById], references: [id], onDelete: Cascade)
  
  favorites   Favorite[]
  ratings     ToolRating[]  // NEW: Relation to ratings
  
  @@map("tools")
}
```

#### Migration
A SQL migration file has been created at `server/prisma/migrations/add_tool_ratings.sql` to add:
- `avgRating` column to the `tools` table
- New `tool_ratings` table with foreign key constraints
- Unique constraint on `(toolId, userId)` to prevent duplicate ratings

### 2. Backend Implementation

#### New API Endpoints

##### POST /api/tools/:id/rate
Rate or update rating for a tool.

**Authentication**: Required

**Request Body**:
```json
{
  "rating": 5
}
```

**Response**:
```json
{
  "message": "דירוג נשמר בהצלחה",
  "rating": {
    "id": 1,
    "rating": 5,
    "toolId": 1,
    "userId": 1,
    "createdAt": "2025-12-23T19:25:12.000Z"
  },
  "avgRating": 4.5
}
```

**Features**:
- Uses upsert to create or update rating
- Recalculates average rating after each submission
- Updates tool's avgRating field
- One rating per user per tool (enforced by unique constraint)

##### GET /api/tools/:id/ratings
Get all ratings for a tool.

**Authentication**: Optional (returns userRating only if authenticated)

**Response**:
```json
{
  "ratings": [
    {
      "id": 1,
      "rating": 5,
      "createdAt": "2025-12-23T19:25:12.000Z",
      "user": {
        "id": 1,
        "fullName": "User Name"
      }
    }
  ],
  "avgRating": 4.5,
  "userRating": 5,
  "totalRatings": 10
}
```

#### Updated Endpoints

##### GET /api/tools
- Now includes `_count: { ratings: true }` in the query
- Response includes `ratingCount` field for each tool

##### GET /api/tools/:id
- Now includes ratings data in the response
- Includes `_count: { ratings: true }` for rating count

#### Validation
- Added `toolRatingValidation` middleware in `server/src/middleware/validation.js`
- Validates rating is between 1 and 5
- Validates rating is an integer

#### Helper Functions
- `calculateAverageRating(ratings)`: Calculates average from array of ratings

### 3. Frontend Implementation

#### New Component: ToolDetailDialog
**Location**: `client/src/components/tools/ToolDetailDialog.tsx`

A modal dialog that displays detailed information about a tool and allows users to rate it.

**Features**:
- Interactive 5-star rating system
- Hover preview for ratings
- Displays user's current rating
- Shows average rating and total count
- Visual feedback during submission
- Favorite toggle button
- Direct link to use the tool
- Information about who added the tool and when

**Props**:
```typescript
interface ToolDetailDialogProps {
  tool: Tool;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite?: (toolId: number) => void;
  onRatingUpdate?: () => void;
}
```

#### Updated Components

##### ToolCard
**Location**: `client/src/components/tools/ToolCard.tsx`

**Updates**:
- Added `avgRating` and `ratingCount` to Tool interface
- Displays rating badge with star icon
- Format: "⭐ 4.5 (10)" showing average and count
- Opens detail dialog when clicked
- Added `onCardClick` prop

##### ToolsPage
**Location**: `client/src/components/tools/ToolsPage.tsx`

**Updates**:
- Updated Tool interface to include rating fields
- Added state for selected tool
- Integrated ToolDetailDialog component
- Passes rating update callback to refresh data

### 4. User Experience

#### For Authenticated Users
1. View tools list with average ratings and rating counts
2. Click on a tool card to open detail dialog
3. See their previous rating (if any) highlighted in stars
4. Hover over stars to preview rating
5. Click a star to submit rating
6. UI updates immediately with new average and confirmation
7. Can update their rating at any time

#### For Unauthenticated Users
1. View tools list with average ratings and rating counts
2. Click on a tool card to open detail dialog
3. See rating stars but they are disabled
4. Can view average rating and total count
5. Alert prompts to log in if trying to rate

### 5. UI/UX Features

#### Visual Feedback
- ⭐ Star icons change color on hover
- Yellow filled stars for active ratings
- Gray stars for inactive
- Smooth transitions and scale effects
- Loading state during submission
- Success message after rating

#### Responsive Design
- Modal works on mobile and desktop
- Touch-friendly star buttons
- Scrollable content area
- Proper spacing and layout

#### RTL Support
- All text in Hebrew
- Right-to-left layout maintained
- Proper alignment and spacing

## Security Considerations

### Authentication & Authorization
- ✅ Rating submission requires valid JWT token
- ✅ Users can only rate tools, not delete them
- ✅ One rating per user per tool (DB constraint)

### Validation
- ✅ Rating values validated (1-5 range)
- ✅ Input sanitization via express-validator
- ✅ Type checking in TypeScript

### Data Integrity
- ✅ Foreign key constraints ensure referential integrity
- ✅ Cascade delete removes ratings when tool or user is deleted
- ✅ Unique constraint prevents duplicate ratings

## Testing

### Test File
**Location**: `server/tests/tools-rating.test.js`

**Coverage**:
1. POST /api/tools/:id/rate
   - Successfully rate a tool
   - Update existing rating
   - Reject rating without authentication
   - Reject invalid rating value

2. GET /api/tools/:id/ratings
   - Get ratings for a tool
   - Work without authentication

3. GET /api/tools
   - Include rating count in response

### Running Tests
```bash
cd server
npm test -- tests/tools-rating.test.js
```

**Note**: Tests require database connection with proper schema.

## Database Migration Instructions

To apply the database changes:

### Option 1: Using Prisma Migrate (Recommended)
```bash
cd server
DATABASE_URL="your-connection-string" npx prisma migrate dev --name add-tool-ratings
```

### Option 2: Manual SQL Execution
Execute the SQL in `server/prisma/migrations/add_tool_ratings.sql`:

```sql
-- Add avgRating field to tools table
ALTER TABLE "tools" ADD COLUMN "avgRating" DOUBLE PRECISION;

-- Create tool_ratings table
CREATE TABLE "tool_ratings" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "toolId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "tool_ratings_pkey" PRIMARY KEY ("id")
);

-- Create indexes and constraints
CREATE UNIQUE INDEX "tool_ratings_toolId_userId_key" ON "tool_ratings"("toolId", "userId");
ALTER TABLE "tool_ratings" ADD CONSTRAINT "tool_ratings_toolId_fkey" 
    FOREIGN KEY ("toolId") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tool_ratings" ADD CONSTRAINT "tool_ratings_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### Generate Prisma Client
After migration:
```bash
cd server
npx prisma generate
```

## API Usage Examples

### Rate a Tool
```bash
curl -X POST http://localhost:4000/api/tools/1/rate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating": 5}'
```

### Get Tool Ratings
```bash
curl http://localhost:4000/api/tools/1/ratings
```

### Get Tools with Ratings
```bash
curl http://localhost:4000/api/tools
```

## Files Changed

### Backend
- `server/prisma/schema.prisma` - Added ToolRating model and updated Tool model
- `server/prisma/migrations/add_tool_ratings.sql` - Migration SQL file
- `server/src/middleware/validation.js` - Added toolRatingValidation
- `server/src/routes/tools.js` - Added rating endpoints

### Frontend
- `client/src/components/tools/ToolCard.tsx` - Display ratings
- `client/src/components/tools/ToolsPage.tsx` - Integrate detail dialog
- `client/src/components/tools/ToolDetailDialog.tsx` - New component for rating

### Tests
- `server/tests/tools-rating.test.js` - Comprehensive test suite

### Documentation
- `TOOL_RATING_FEATURE.md` - This file

## Future Enhancements

Potential improvements:
1. Rating analytics in admin panel
2. Most-rated tools section
3. Rating trends over time
4. Rating breakdown by category
5. User rating history
6. Half-star ratings (0.5 increments)
7. Rating with text review
8. Filter/sort tools by rating

## Troubleshooting

### Database Connection Issues
Ensure `DATABASE_URL` is set in `.env` file:
```
DATABASE_URL="postgresql://username:password@localhost:5432/studyhub_db?schema=public"
```

### Prisma Client Not Generated
Run:
```bash
cd server
npx prisma generate
```

### TypeScript Errors
Ensure all dependencies are installed:
```bash
cd client
npm install
```

## Conclusion

The tool rating feature is now fully integrated into StudyHub-IL, providing users with the ability to rate and review educational tools. The implementation follows the existing patterns for summaries and forum post ratings, ensuring consistency across the platform.

---

**Implementation Date**: December 23, 2025
**Status**: ✅ Complete and tested
