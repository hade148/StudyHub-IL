# StudyHub-IL Profile System 👤📊

## Overview
A comprehensive Hebrew RTL user profile system with 6 tabs, statistics, achievements, and full edit functionality.

## Components

### ProfilePageNew.tsx (Main Component)
The main profile page component with complete functionality:
- **6 Tabs**: Overview, My Summaries, Favorites, Forum Activity, Achievements, Statistics
- **Edit Profile Modal**: Full profile editing with avatar upload
- **Responsive Design**: Mobile/Tablet/Desktop layouts
- **RTL Support**: Complete Hebrew RTL layout

### ProfileHeader.tsx
Enhanced profile header with:
- Cover photo (gradient or uploaded image)
- Avatar with online status indicator
- User information (name, role, bio, location, institution, field of study, join date)
- Edit profile and settings buttons
- Upload cover/avatar buttons on hover

### ProfileStatsBar.tsx
4 statistics cards with:
- Uploads (📚)
- Downloads (⬇️) with monthly growth
- Reputation (⭐)
- Contributions (💬)
- Gradient backgrounds and hover effects

### AboutSection.tsx
User information display:
- Bio
- Location with icon
- Institution with icon
- Field of study with icon
- Website link
- Skills/interests tags

### ActivityTimeline.tsx
Recent activity feed:
- Upload activities
- Forum answers
- Badge achievements
- Favorites
- Comments
- Color-coded icons

### RecentActivityWidget.tsx
Quick stats widget:
- Weekly views
- New comments
- Average rating
- Color-coded metrics

### AchievementsTab.tsx
Comprehensive achievements system:
- **4 Categories**: General, Summaries, Forum, Special
- **4 Rarity Levels**: Common, Rare, Epic, Legendary
- **20 Achievements** with progress tracking
- Visual badges with icons and descriptions
- Progress bars for unearned achievements
- Earned date display

### StatisticsTab.tsx
Data visualization with Recharts:
- **4 Summary Cards**: Profile views, weekly downloads, average rating, response rate
- **4 Charts**:
  - Views over time (Line chart)
  - Downloads by summary (Bar chart)
  - Forum activity (Area chart)
  - Reputation growth (Line chart)
- **Detailed Stats Tables**:
  - Upload statistics
  - Forum statistics
  - Engagement metrics

### EditProfileModal.tsx
Full-featured edit modal:
- Avatar upload with preview
- Name, bio (500 char limit)
- Location
- Institution
- Field of study
- Website
- Skills/interests (add/remove tags)
- Save/Cancel buttons
- Smooth animations

## Tab Details

### Tab 1 - Overview (סקירה כללית)
- Activity timeline
- Popular uploads (top 3)
- Left sidebar: About section
- Right sidebar: Recent activity widget

### Tab 2 - My Summaries (סיכומים שלי)
- Search bar
- Sort options (recent, popular, rating)
- Upload new summary button
- Summary cards with:
  - Title, subject
  - Views, downloads, rating
  - Edit/Delete/Statistics buttons
- Empty state with call-to-action

### Tab 3 - Favorites (מועדפים)
- Sub-tabs: Summaries / Posts
- Favorite summary cards
- Remove from favorites button
- Empty state

### Tab 4 - Forum Activity (פעילות בפורום)
- Sub-tabs: Questions / Answers
- **Questions**: Status badges, edit/delete, stats
- **Answers**: Accepted badge, votes, question link
- Empty states

### Tab 5 - Achievements (הישגים)
- Category tabs (General, Summaries, Forum, Special)
- Achievement cards with:
  - Icon (grayscale if not earned)
  - Name and description
  - Rarity badge
  - Earned status or progress bar
  - Earned date
- Progress overview at top
- Rarity legend at bottom

### Tab 6 - Statistics (סטטיסטיקות)
- Summary metrics cards
- 4 interactive charts
- Detailed statistics tables
- Forum and engagement metrics

## Data Structure

```typescript
interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
  coverPhoto?: string;
  role: 'student' | 'lecturer' | 'admin';
  bio: string;
  location: string;
  institution: string;
  fieldOfStudy: string;
  website: string;
  interests: string[];
  joinDate: string;
  isOnline: boolean;
  
  stats: {
    uploads: number;
    totalDownloads: number;
    reputation: number;
    forumPosts: number;
    totalViews: number;
    averageRating: number;
    responseRate: number;
    weeklyViews: number;
    monthlyDownloads: number;
    followers: number;
    following: number;
    profileViews: number;
  };
  
  recentActivity: Activity[];
  mySummaries: Summary[];
  favorites: Favorite[];
  forumQuestions: Question[];
  forumAnswers: Answer[];
  topSummaries: Summary[];
}

interface Achievement {
  id: number;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'general' | 'summaries' | 'forum' | 'special';
}
```

## Features

### ✨ Interactions
- Hover effects on all cards
- Smooth animations with Motion
- Click-to-edit functionality
- Modal overlays
- Tab navigation
- Search and filter

### 🎨 Visual Design
- Gradient accents (blue to purple)
- Color-coded categories
- Badge system
- Progress indicators
- Icons from lucide-react
- Emojis for visual appeal

### 📱 Responsive Design
- Desktop: 2-column layout with sidebar
- Tablet: Stacked columns
- Mobile: Full-width cards, smaller avatars

### ♿ Accessibility
- Keyboard navigation
- ARIA labels
- Focus states
- Screen reader support

## Usage

```tsx
import { ProfilePageNew } from './components/profile/ProfilePageNew';

function App() {
  return (
    <div dir="rtl">
      <ProfilePageNew onNavigateHome={() => console.log('Navigate home')} />
    </div>
  );
}
```

## API Integration (Future)

```javascript
// Get user profile
GET /api/users/:username

// Update profile
PUT /api/users/:username

// Upload avatar
POST /api/users/:username/avatar

// Upload cover
POST /api/users/:username/cover

// Get user stats
GET /api/users/:username/stats

// Get user activity
GET /api/users/:username/activity?page=1&limit=20
```

## Color Palette

```css
Profile Gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Blue: #3B82F6
Purple: #8B5CF6
Green: #10B981
Orange: #F59E0B
Yellow: #F59E0B
Pink: #EC4899

Rarity Colors:
- Common: Gray (#6B7280)
- Rare: Blue (#3B82F6)
- Epic: Purple (#8B5CF6)
- Legendary: Gold (#F59E0B)
```

## Dependencies

- React
- motion/react (animations)
- recharts (charts)
- lucide-react (icons)
- UI components from ../ui/

## Notes

- All text is in Hebrew
- RTL layout throughout
- Professional academic aesthetic
- Smooth animations and transitions
- Production-ready code
