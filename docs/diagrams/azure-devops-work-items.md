# Azure DevOps Work Items - StudyHub-IL

This document maps the Use Case diagram to Azure DevOps work items (Features, User Stories, and Tasks).

## Overview

Each Use Case from the diagram is mapped to a **Feature**. Each Feature is then broken down into **User Stories**, and each User Story is decomposed into specific **Tasks**.

---

## Feature 1: הרשמה / התחברות (Registration / Login)

**Description:** Allow users to create accounts and authenticate to access the platform.

### User Stories:

#### US-1.1: User Registration
**As a** guest user  
**I want to** create a new account with email and password  
**So that** I can access protected features of the platform

**Tasks:**
- Task 1.1.1: Design registration form UI with Hebrew RTL support
- Task 1.1.2: Implement client-side form validation
- Task 1.1.3: Create user registration API endpoint
- Task 1.1.4: Implement email verification system
- Task 1.1.5: Add password strength requirements and validation
- Task 1.1.6: Create database schema for users table
- Task 1.1.7: Write unit tests for registration flow
- Task 1.1.8: Write integration tests for registration API

#### US-1.2: User Login
**As a** registered user  
**I want to** log in with my credentials  
**So that** I can access my account and protected features

**Tasks:**
- Task 1.2.1: Design login form UI
- Task 1.2.2: Implement authentication logic with JWT
- Task 1.2.3: Create login API endpoint
- Task 1.2.4: Add session management
- Task 1.2.5: Implement "Remember Me" functionality
- Task 1.2.6: Add login attempt rate limiting
- Task 1.2.7: Write unit tests for login flow
- Task 1.2.8: Write integration tests for authentication API

#### US-1.3: Password Reset
**As a** registered user  
**I want to** reset my password if I forget it  
**So that** I can regain access to my account

**Tasks:**
- Task 1.3.1: Design password reset request form
- Task 1.3.2: Implement password reset email sending
- Task 1.3.3: Create password reset token generation
- Task 1.3.4: Design password reset confirmation page
- Task 1.3.5: Implement password update API endpoint
- Task 1.3.6: Add token expiration handling
- Task 1.3.7: Write tests for password reset flow

---

## Feature 2: חיפוש/עיון בסיכומים (Search/Browse Summaries)

**Description:** Enable users to search for and browse study summaries.

### User Stories:

#### US-2.1: Browse Summaries
**As a** guest or registered user  
**I want to** browse available study summaries  
**So that** I can find relevant learning materials

**Tasks:**
- Task 2.1.1: Design summaries listing page with grid/list view
- Task 2.1.2: Create API endpoint to fetch summaries
- Task 2.1.3: Implement pagination for summaries list
- Task 2.1.4: Add filtering by course/subject
- Task 2.1.5: Add sorting options (date, rating, popularity)
- Task 2.1.6: Implement summary preview/thumbnail
- Task 2.1.7: Write unit tests for browsing functionality
- Task 2.1.8: Optimize database queries for performance

#### US-2.2: Search Summaries
**As a** user  
**I want to** search for summaries using keywords  
**So that** I can quickly find specific content

**Tasks:**
- Task 2.2.1: Design search bar component
- Task 2.2.2: Implement full-text search functionality
- Task 2.2.3: Create search API endpoint
- Task 2.2.4: Add autocomplete/suggestions
- Task 2.2.5: Implement advanced search filters
- Task 2.2.6: Add search history for logged-in users
- Task 2.2.7: Optimize search queries with indexing
- Task 2.2.8: Write tests for search functionality

#### US-2.3: View Summary Details
**As a** user  
**I want to** view detailed information about a summary  
**So that** I can assess its relevance before downloading

**Tasks:**
- Task 2.3.1: Design summary detail page
- Task 2.3.2: Create API endpoint for summary details
- Task 2.3.3: Display summary metadata (author, date, course)
- Task 2.3.4: Implement rating display
- Task 2.3.5: Add comments/reviews section
- Task 2.3.6: Add download/view functionality
- Task 2.3.7: Track view counts
- Task 2.3.8: Write tests for detail view

---

## Feature 3: העלאת/שיתוף סיכומים (Upload/Share Summaries)

**Description:** Allow authenticated users to upload and share their study summaries.

**<<include>> Authentication** - This feature requires users to be logged in.

### User Stories:

#### US-3.1: Upload Summary
**As a** registered student  
**I want to** upload my study summaries  
**So that** I can share my knowledge with other students

**Tasks:**
- Task 3.1.1: Design summary upload form
- Task 3.1.2: Implement file upload component (PDF, DOCX, images)
- Task 3.1.3: Add file validation and size limits
- Task 3.1.4: Create upload API endpoint with authentication check
- Task 3.1.5: Implement file storage (cloud storage integration)
- Task 3.1.6: Add metadata form (title, description, course, tags)
- Task 3.1.7: Implement preview generation
- Task 3.1.8: Add virus scanning for uploaded files
- Task 3.1.9: Write unit tests for upload functionality
- Task 3.1.10: Write integration tests with authentication

#### US-3.2: Edit Summary
**As a** summary author  
**I want to** edit my uploaded summaries  
**So that** I can correct mistakes or add updates

**Tasks:**
- Task 3.2.1: Design summary edit page
- Task 3.2.2: Implement edit authorization check (owner only)
- Task 3.2.3: Create update API endpoint
- Task 3.2.4: Add version history tracking
- Task 3.2.5: Implement file replacement
- Task 3.2.6: Write tests for edit functionality

#### US-3.3: Delete Summary
**As a** summary author  
**I want to** delete my summaries  
**So that** I can remove outdated or incorrect content

**Tasks:**
- Task 3.3.1: Add delete button with confirmation dialog
- Task 3.3.2: Create delete API endpoint with authorization
- Task 3.3.3: Implement soft delete (archive instead of permanent deletion)
- Task 3.3.4: Clean up associated files from storage
- Task 3.3.5: Write tests for delete functionality

---

## Feature 4: יצירת/הצטרפות לדיון (Create/Join Discussion)

**Description:** Enable users to create discussion forums and participate in conversations.

**<<include>> Authentication** - This feature requires users to be logged in.

### User Stories:

#### US-4.1: Create Discussion
**As a** registered student  
**I want to** create a new discussion topic  
**So that** I can ask questions or start conversations

**Tasks:**
- Task 4.1.1: Design discussion creation form
- Task 4.1.2: Implement discussion creation with authentication check
- Task 4.1.3: Create discussion API endpoint
- Task 4.1.4: Add categories/tags for discussions
- Task 4.1.5: Implement markdown support for rich text
- Task 4.1.6: Add file attachments to discussions
- Task 4.1.7: Write tests for discussion creation

#### US-4.2: Join/View Discussion
**As a** registered student  
**I want to** view and participate in discussions  
**So that** I can learn from others and contribute

**Tasks:**
- Task 4.2.1: Design discussion thread view
- Task 4.2.2: Create API to fetch discussion threads
- Task 4.2.3: Implement reply/comment functionality
- Task 4.2.4: Add nested replies support
- Task 4.2.5: Implement real-time updates (WebSocket/polling)
- Task 4.2.6: Add like/upvote functionality
- Task 4.2.7: Implement mention/notification system
- Task 4.2.8: Write tests for discussion participation

#### US-4.3: Moderate Discussion
**As a** moderator  
**I want to** manage discussions  
**So that** I can maintain quality and remove inappropriate content

**Tasks:**
- Task 4.3.1: Add moderator controls (pin, lock, delete)
- Task 4.3.2: Implement moderation API endpoints
- Task 4.3.3: Add role-based access control
- Task 4.3.4: Create moderation logs
- Task 4.3.5: Write tests for moderation features

---

## Feature 5: איתור/התאמת שותף לימוד (Find/Match Study Partner)

**Description:** Help students find compatible study partners based on courses and preferences.

**<<include>> Authentication** - This feature requires users to be logged in.

### User Stories:

#### US-5.1: Create Study Partner Profile
**As a** registered student  
**I want to** create a study partner profile  
**So that** other students can find me

**Tasks:**
- Task 5.1.1: Design study partner profile form
- Task 5.1.2: Add fields (courses, availability, study preferences)
- Task 5.1.3: Create profile API endpoint with authentication
- Task 5.1.4: Implement profile visibility settings
- Task 5.1.5: Write tests for profile creation

#### US-5.2: Search for Study Partners
**As a** registered student  
**I want to** search for study partners  
**So that** I can find compatible students to study with

**Tasks:**
- Task 5.2.1: Design partner search interface
- Task 5.2.2: Implement search/filter by courses
- Task 5.2.3: Add matching algorithm based on preferences
- Task 5.2.4: Create search API endpoint
- Task 5.2.5: Display compatibility scores
- Task 5.2.6: Write tests for search functionality

#### US-5.3: Connect with Study Partner
**As a** registered student  
**I want to** send connection requests to potential study partners  
**So that** we can coordinate our studies

**Tasks:**
- Task 5.3.1: Design connection request UI
- Task 5.3.2: Implement connection request system
- Task 5.3.3: Create connection API endpoints
- Task 5.3.4: Add notification for connection requests
- Task 5.3.5: Implement accept/decline functionality
- Task 5.3.6: Write tests for connection flow

---

## Feature 6: תיאום מפגש לימוד (Schedule Study Meeting)

**Description:** Allow study partners to schedule and coordinate study sessions.

**<<include>> Authentication** - This feature requires users to be logged in.

### User Stories:

#### US-6.1: Create Study Meeting
**As a** registered student  
**I want to** create a study meeting  
**So that** I can organize study sessions with my partners

**Tasks:**
- Task 6.1.1: Design meeting creation form
- Task 6.1.2: Implement date/time picker with Hebrew support
- Task 6.1.3: Add location input (physical/online)
- Task 6.1.4: Create meeting API endpoint with authentication
- Task 6.1.5: Add participant invitation system
- Task 6.1.6: Implement calendar integration
- Task 6.1.7: Write tests for meeting creation

#### US-6.2: View Scheduled Meetings
**As a** registered student  
**I want to** view my scheduled meetings  
**So that** I can keep track of my study sessions

**Tasks:**
- Task 6.2.1: Design calendar/list view for meetings
- Task 6.2.2: Create API to fetch user meetings
- Task 6.2.3: Implement meeting reminders
- Task 6.2.4: Add filtering by date/course
- Task 6.2.5: Write tests for meeting view

#### US-6.3: Manage Meeting
**As a** meeting organizer  
**I want to** update or cancel meetings  
**So that** I can adjust plans when needed

**Tasks:**
- Task 6.3.1: Design meeting edit/cancel UI
- Task 6.3.2: Create update/delete API endpoints
- Task 6.3.3: Implement notification for changes
- Task 6.3.4: Add cancellation reason field
- Task 6.3.5: Write tests for meeting management

---

## Feature 7: דיווח על תוכן בלתי הולם (Report Inappropriate Content)

**Description:** Enable users to report inappropriate or policy-violating content.

**<<extend>> Browse Summaries** - This is an optional action that extends the browsing functionality.

### User Stories:

#### US-7.1: Report Content
**As a** registered user or moderator  
**I want to** report inappropriate content  
**So that** the platform remains safe and high-quality

**Tasks:**
- Task 7.1.1: Design report form/modal
- Task 7.1.2: Add report button to content items
- Task 7.1.3: Create report categories (spam, offensive, copyright, etc.)
- Task 7.1.4: Create report API endpoint
- Task 7.1.5: Implement report storage and tracking
- Task 7.1.6: Add duplicate report detection
- Task 7.1.7: Write tests for reporting functionality

#### US-7.2: Review Reports
**As a** moderator or admin  
**I want to** review reported content  
**So that** I can take appropriate action

**Tasks:**
- Task 7.2.1: Design report dashboard for moderators
- Task 7.2.2: Create API to fetch pending reports
- Task 7.2.3: Implement report filtering and sorting
- Task 7.2.4: Add action buttons (approve, reject, remove content)
- Task 7.2.5: Create action API endpoints
- Task 7.2.6: Implement notification to reporter
- Task 7.2.7: Add report resolution logging
- Task 7.2.8: Write tests for report review

#### US-7.3: Content Moderation
**As an** admin  
**I want to** manage moderation policies  
**So that** the platform maintains consistent standards

**Tasks:**
- Task 7.3.1: Create admin panel for moderation settings
- Task 7.3.2: Implement content flagging rules
- Task 7.3.3: Add automatic content scanning
- Task 7.3.4: Create moderation audit log
- Task 7.3.5: Write tests for moderation features

---

## Summary

### Total Work Items:
- **Features:** 7
- **User Stories:** 23
- **Tasks:** 178

### Priority Mapping:
1. **High Priority (MVP):** Features 1, 2, 3 - Core authentication and content management
2. **Medium Priority:** Features 4, 5 - Community features
3. **Lower Priority:** Features 6, 7 - Advanced scheduling and moderation

### Dependencies:
- Feature 1 (Authentication) must be completed first as it's included in Features 3, 4, 5, and 6
- Feature 2 (Browse) should be completed before Feature 7 (Report) as it extends browsing functionality
- Features 3-6 can be developed in parallel after Feature 1 is complete

### Estimated Timeline:
- Sprint 1-2: Feature 1 (Authentication)
- Sprint 3-4: Feature 2 (Browse Summaries)
- Sprint 5-6: Feature 3 (Upload Summaries)
- Sprint 7-8: Feature 4 (Discussions)
- Sprint 9-10: Feature 5 (Study Partners)
- Sprint 11-12: Feature 6 (Meeting Scheduling)
- Sprint 13-14: Feature 7 (Content Reporting & Moderation)

---

## Notes

- All Hebrew text should maintain RTL (Right-to-Left) support
- All authenticated features require JWT token validation
- Database schema should support all features with proper relationships
- Consider implementing feature flags for gradual rollout
- Security scanning and testing should be integrated in all sprints
- Accessibility (WCAG 2.1 AA) should be maintained throughout
