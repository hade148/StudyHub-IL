# Tools Feature Documentation

## Overview
The Tools feature allows users to add, view, and manage educational tools in the StudyHub-IL platform.

## Features Implemented

### 1. Add Tool Dialog
- Users can add new tools from the dashboard or tools page
- Required fields:
  - **Title** (שם הכלי): Name of the tool
  - **URL** (קישור לכלי): Link to the tool
  - **Category** (קטגוריה): Category selection from predefined list
- Optional field:
  - **Description** (תיאור): Brief description of the tool

### 2. Tool Categories
Available categories:
- מחשבונים (Calculators) 🧮
- ממירים (Converters) 🔄
- מתכננים (Planners) 📅
- יצירה (Creation) ✏️
- אחר (Other) 📦

### 3. Tools Display
- Tools are displayed in a grid layout with cards
- Each card shows:
  - Tool icon (emoji based on category)
  - Tool name and description
  - Category badge
  - "Use Tool" button (opens tool URL in new tab)
  - Favorite button (heart icon)

### 4. Favorites Functionality
- Users can mark tools as favorites by clicking the heart icon
- Favorite status is saved to the database
- Filter tools by "Favorites" category
- Favorite count displayed in stats section

### 5. Navigation
- "Add Tool" button in the dashboard Quick Actions
- "Add Tool" button in the tools page header
- Category tabs for filtering tools
- Empty state with call-to-action when no tools exist

## API Endpoints

### Tools
- `GET /api/tools` - Get all tools (with optional category filter)
- `GET /api/tools/:id` - Get single tool
- `POST /api/tools` - Create new tool (requires authentication)
- `DELETE /api/tools/:id` - Delete tool (requires authentication and ownership)

### Favorites
- `GET /api/favorites` - Get user's favorites (requires authentication)
- `POST /api/favorites/tool/:id` - Add tool to favorites (requires authentication)
- `DELETE /api/favorites/tool/:id` - Remove tool from favorites (requires authentication)

## Database Schema

### Tool Model
```prisma
model Tool {
  id          Int      @id @default(autoincrement())
  title       String
  url         String
  description String?
  category    String?
  createdAt   DateTime @default(now())
  addedById   Int
  addedBy     User     @relation(fields: [addedById], references: [id])
  favorites   Favorite[]
}
```

### Favorite Model
```prisma
model Favorite {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  summaryId Int?
  summary   Summary? @relation(fields: [summaryId], references: [id])
  toolId    Int?
  tool      Tool?    @relation(fields: [toolId], references: [id])
  
  @@unique([userId, summaryId])
  @@unique([userId, toolId])
}
```

## Testing

Run the tools API tests:
```bash
cd server
npm test -- tests/tools.test.js
```

## UI Components

### AddToolDialog
Location: `client/src/components/tools/AddToolDialog.tsx`
- Modal dialog for adding new tools
- Form validation
- Success/error messages
- Category selection dropdown

### ToolCard
Location: `client/src/components/tools/ToolCard.tsx`
- Displays individual tool information
- Favorite toggle button
- "Use Tool" button (opens URL in new tab)
- Color-coded by category

### ToolsPage
Location: `client/src/components/tools/ToolsPage.tsx`
- Main tools page with category filtering
- Fetches tools from API
- Handles favorites
- Shows statistics

## Success Messages
- After adding a tool: "הכלי נוסף בהצלחה! ✅"
- Display duration: 3 seconds
- Auto-refresh tools list after addition

## Known Limitations
- Tools cannot be edited after creation (only deletion by owner/admin)
- No tool rating or review system
- No tool search functionality (planned for future)
