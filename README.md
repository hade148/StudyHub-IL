# StudyHub-IL 🎓

> **Empowering Israeli Students Through Collaborative Learning**

A comprehensive, modern academic platform designed to connect students across Israeli institutions, enabling them to share study materials, engage in meaningful discussions, and access powerful educational tools—all in one unified platform.

---

## 🌟 Overview

StudyHub-IL is a full-stack web application built to address the challenges faced by students in Israeli academic institutions. Whether you're looking for course summaries, need help with a complex algorithm, or want to share educational resources with your peers, StudyHub-IL provides an intuitive, secure, and feature-rich environment for collaborative learning.

### What Problem Does It Solve? 

- **Fragmented Resources**: Students often struggle to find quality study materials scattered across multiple platforms
- **Limited Collaboration**: No centralized platform for academic discussions and peer support
- **Resource Discovery**: Difficulty finding and sharing educational tools and materials
- **Institutional Silos**: Students from different universities can't easily connect and collaborate

### Core Value Proposition

StudyHub-IL brings together **summaries**, **discussions**, and **tools** in a single, beautifully designed platform with full Hebrew (RTL) support, modern UI/UX, and robust authentication and authorization systems. 

---

## ✨ Key Features

### 🔐 **Complete Authentication System**
- User registration with email verification
- Secure login with JWT-based authentication
- Password reset and recovery flow
- Role-based access control (User/Admin)
- Protected routes and API endpoints

### 📚 **Summaries Management**
- Upload and share course summaries (PDF, DOCX)
- Search and filter by course, institution, or keyword
- Rate and comment on summaries
- Download and favorite study materials
- Cloud storage integration with Azure Blob Storage

### 💬 **Interactive Forum**
- Create discussion posts with rich text formatting
- Upload images to illustrate questions
- Tag posts by topic and programming language
- Rate and comment on posts
- Filter by category, course, and urgency
- Real-time search across all discussions

### 🛠️ **Educational Tools Hub**
- Discover and share useful learning tools
- Categorized by type (IDE, Converter, Tutorial, etc.)
- Rate and favorite tools
- Community-driven recommendations
- Quick access to external resources

### 👤 **Rich User Profiles**
- Customizable profile with avatar upload
- Activity tracking and statistics
- View user contributions (summaries, posts, tools)
- Personal content management dashboard
- Achievement and engagement metrics

### 📊 **Content Management**
- Unified dashboard to manage all your content
- Edit summaries, tools, and forum posts
- Delete or update your contributions
- Track engagement metrics (views, ratings, comments)

### 🔔 **Notifications & Engagement**
- Real-time notifications for interactions
- Favorites system for summaries and tools
- Comment and rating systems
- User subscriptions and activity tracking

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS 4
- **UI Components**: shadcn/ui with Radix UI primitives
- **Animations**: Motion (Framer Motion)
- **Forms**: React Hook Form
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React

### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 5
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Email**:  Nodemailer (SMTP)

### **Cloud & DevOps**
- **Database**: Azure Database for PostgreSQL Flexible Server
- **Storage**: Azure Blob Storage
- **CI/CD**: Azure DevOps Pipelines
- **Testing**: Jest (Backend), Selenium WebDriver (E2E)

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**:  v18. 0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **PostgreSQL**: v14.0 or higher ([Download](https://www.postgresql.org/download/))
- **Git**: Latest version ([Download](https://git-scm.com/))

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/hade148/StudyHub-IL.git
cd StudyHub-IL
```

#### 2. Backend Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

#### 3. Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database (choose one based on your setup)
# Local PostgreSQL:
DATABASE_URL="postgresql://postgres:password@localhost:5432/studyhub"

# OR Azure PostgreSQL:
# DATABASE_URL="postgresql://dbadmin:PASSWORD@studyhub-db.postgres.database.azure.com:5432/studyhub_dev? sslmode=require"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=4000
NODE_ENV=development
CLIENT_URL="http://localhost:5173"

# Email Configuration (Optional - for password reset)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Azure Storage (Optional - for file uploads)
AZURE_STORAGE_CONNECTION_STRING="your-connection-string"
AZURE_STORAGE_CONTAINER_NAME="studyhub-files"
```

#### 4. Database Setup

Generate Prisma client and run migrations:

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npm run seed
```

**Default Test Users:**
- **Student**: `student@studyhub.local` / `password123`
- **Admin**: `admin@studyhub.local` / `password123`

#### 5. Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# OR Production mode
npm start
```

The backend server will run on `http://localhost:4000`

#### 6. Frontend Setup

Open a new terminal and navigate to the client directory:

```bash
cd client
npm install
```

#### 7. Start Frontend Development Server

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

#### 8. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 📸 Screenshots & Demo

### Homepage & Dashboard
![Dashboard Overview](docs/screenshots/dashboard.png)
*Main dashboard showing stats, recent summaries, and forum activity*

### Authentication System
![Login Page](docs/screenshots/login.png)
*Modern, secure login interface with Hebrew RTL support*

### Forum Discussions
![Forum Page](docs/screenshots/forum.png)
*Interactive forum with search, filters, and rich post creation*

### Summaries Library
![Summaries Page](docs/screenshots/summaries.png)
*Searchable library of course summaries with ratings and downloads*

### Educational Tools
![Tools Page](docs/screenshots/tools.png)
*Curated collection of educational tools with ratings and favorites*

### User Profile
![Profile Page](docs/screenshots/profile.png)
*Comprehensive user profile with statistics and activity tracking*

> **Note**: Place actual screenshots in a `docs/screenshots/` directory for best presentation

---

## 📁 Project Structure

```
StudyHub-IL/
├── client/                  # React TypeScript Frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── dashboard/   # Dashboard components
│   │   │   ├── summaries/   # Summaries feature
│   │   │   ├── forum/       # Forum feature
│   │   │   ├── tools/       # Tools feature
│   │   │   ├── profile/     # User profile
│   │   │   ├── content/     # Content management
│   │   │   └── ui/          # Reusable UI components (shadcn)
│   │   ├── context/         # React Context (Auth)
│   │   ├── utils/           # Utilities and API client
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   └── vite.config.ts       # Vite configuration
│
├── server/                  # Node.js Express Backend
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   │   ├── auth. js      # Authentication routes
│   │   │   ├── summaries.js # Summaries CRUD
│   │   │   ├── forum.js     # Forum posts & comments
│   │   │   ├── tools.js     # Educational tools
│   │   │   ├── courses.js   # Course management
│   │   │   └── ...           # Other routes
│   │   ├── middleware/      # Express middleware
│   │   │   ├── auth.js      # JWT authentication
│   │   │   └── validation.js # Input validation
│   │   ├── utils/           # Utility functions
│   │   │   ├── jwt.js       # JWT helpers
│   │   │   ├── email.js     # Email sending
│   │   │   └── azureStorage.js # Azure Blob Storage
│   │   ├── lib/             # Libraries
│   │   │   └── prisma.js    # Prisma client
│   │   └── index.js         # Express app entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.js          # Database seeding
│   ├── uploads/             # Local file uploads
│   ├── package.json
│   └── . env. example         # Environment variables template
│
├── selenium-tests/          # End-to-End Tests
│   ├── test_01_user_authentication.py
│   ├── test_02_summary_upload.py
│   ├── test_03_forum_interaction.py
│   ├── test_04_tools_usage.py
│   └── test_05_profile_management.py
│
├── docs/                    # Documentation
├── azure-pipelines.yml      # CI/CD configuration
└── README.md                # This file
```

---

## 🔧 Available Scripts

### Backend (server/)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with auto-reload |
| `npm start` | Start production server |
| `npm test` | Run Jest unit tests |
| `npm run lint` | Run ESLint code analysis |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run database migrations (dev) |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |
| `npm run seed` | Seed database with sample data |
| `npm run db:reset` | Reset database (⚠️ deletes all data) |

### Frontend (client/)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code analysis |

### End-to-End Tests (selenium-tests/)

```bash
cd selenium-tests
pip install -r requirements.txt
pytest -v                    # Run all tests
pytest --html=report.html    # Generate HTML report
```

---

## 🔒 Authentication & Security

StudyHub-IL implements industry-standard security practices:

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure, stateless authentication
- **Rate Limiting**: Prevents brute-force attacks
- **Input Validation**: Server-side validation with express-validator
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **XSS Protection**: Helmet. js security headers
- **CORS**:  Configured for specific origins
- **HTTPS**: Enforced in production (Azure)
- **Environment Variables**: Secrets stored securely

---

## 🗄️ Database Schema

The database consists of the following main models:

- **User**: User accounts with authentication and profile data
- **Course**: Academic courses from various institutions
- **Summary**:  Uploaded study summaries
- **Rating**: Star ratings for summaries
- **Comment**: Comments on summaries
- **ForumPost**: Discussion forum posts
- **ForumComment**: Comments on forum posts
- **ForumRating**:  Ratings for forum posts
- **Tool**: Educational tools and resources
- **ToolRating**:  Ratings for tools
- **Favorite**: User favorites (summaries, tools)
- **Notification**: User notifications
- **HelpRequest**: Study help requests
- **Report**: Content reporting system

For complete schema details, see [`server/prisma/schema.prisma`](server/prisma/schema.prisma)

---

## 📡 API Documentation

### Base URL
```
http://localhost:4000/api
```
---

## 🧪 Testing

### Backend Unit Tests

```bash
cd server
npm test
```

Coverage includes:
- Authentication flows
- API route handlers
- Database operations
- Validation logic

### End-to-End Tests (Selenium)

Comprehensive E2E tests covering all critical user flows:

```bash
cd selenium-tests
pip install -r requirements.txt

# Run all tests
pytest -v

# Run specific test
pytest test_01_user_authentication.py -v

# Generate HTML report
pytest --html=report.html --self-contained-html
```

**Test Coverage:**
- ✅ User registration and email verification
- ✅ Login and logout flows
- ✅ Summary upload and management
- ✅ Forum post creation and interaction
- ✅ Educational tools usage
- ✅ User profile management
- ✅ Content rating and reviews

For detailed testing documentation, see: 
- [Selenium Testing Guide (Hebrew)](SELENIUM_TESTING_GUIDE_HE.md)
- [Quick Reference Guide](SELENIUM_QUICK_REFERENCE.md)
- [Test Planning](TEST_PLANNING.md)

---

## ☁️ Deployment

### Azure PostgreSQL Configuration

The application supports both local and Azure Database for PostgreSQL Flexible Server.

**Environment Variables:**

```env
# Local Development
DATABASE_URL="postgresql://postgres:password@localhost:5432/studyhub"

# Azure PostgreSQL (Development)
DATABASE_URL="postgresql://dbadmin:PASSWORD@studyhub-db.postgres.database. azure.com:5432/studyhub_dev? sslmode=require"

# Azure PostgreSQL (Production)
DATABASE_URL="postgresql://dbadmin:PASSWORD@studyhub-db.postgres.database.azure. com:5432/studyhub_prod?sslmode=require"
```

**Important Notes:**
- ⚠️ Azure connections **require** `sslmode=require` parameter
- Configure firewall rules to allow your IP address
- Never commit `.env` files with real credentials
- Use Azure Key Vault or environment variables in production

For detailed database setup instructions, see:  [Database Setup Guide](server/docs/DATABASE_SETUP. md)

### CI/CD with Azure DevOps

The project includes a comprehensive Azure Pipelines configuration:

- Automated builds and tests
- Environment-specific deployments (Dev, Staging, Production)
- Automated database migrations with Prisma
- Azure PostgreSQL integration

See [Azure Pipeline Guide](AZURE_PIPELINE_GUIDE.md) for details.

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**:  `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add some amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Code Standards

- Follow existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📚 Additional Documentation

Comprehensive documentation is available for all major features:

### Feature Guides
- [Authentication System (Hebrew)](client/src/components/auth/README.md)
- [Profile System (Hebrew)](client/src/components/profile/README.md)
- [Forum Feature Guide](md%20files/FORUM_FEATURE_GUIDE.md)
- [Tools Feature Documentation](md%20files/TOOLS_FEATURE. md)
- [Content Management Implementation](md%20files/CONTENT_MANAGEMENT_IMPLEMENTATION.md)

### Testing & QA
- [Selenium Testing Guide (Hebrew)](SELENIUM_TESTING_GUIDE_HE.md)
- [Quick Reference Guide](SELENIUM_QUICK_REFERENCE. md)
- [Test Planning Methodology](TEST_PLANNING.md)
- [Bug Tracking Guide](BUG_TRACKING.md)
- [Wiki Test Summary](WIKI_TEST_SUMMARY.md)

### Development Guides
- [Database Setup Guide](server/docs/DATABASE_SETUP.md)
- [Azure Pipeline Configuration](AZURE_PIPELINE_GUIDE.md)
- [Phase 5 Checklist (Testing)](PHASE5_CHECKLIST.md)

---

## 🐛 Troubleshooting

### Common Issues

#### "Column does not exist" Database Error
```bash
# Solution: Sync database schema
cd server
./sync-database.sh  # Linux/Mac
sync-database.bat   # Windows
```

#### Frontend Not Connecting to Backend
- Verify backend is running on port 4000
- Check `CLIENT_URL` in server `.env`
- Ensure CORS is configured correctly

#### File Upload Failing
- Check file size (max 10MB)
- Verify file type (PDF or DOCX only)
- Ensure `uploads/` directory exists and is writable
- Check Azure Blob Storage configuration if using cloud storage

#### Login/Authentication Issues
- Verify JWT_SECRET is set in `.env`
- Check token expiration settings
- Clear browser localStorage and cookies
- Ensure database is seeded with test users

---

## 📄 License

© 2025 StudyHub-IL. All rights reserved.

This project is developed as part of an academic software engineering course and is intended for educational purposes. 

---

## 👥 Authors

- **hade148** - *Initial work and development* - [GitHub Profile](https://github.com/hade148)

---

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Radix UI** for accessible UI primitives
- **Prisma** for the excellent ORM
- **Azure** for cloud infrastructure
- All contributors and testers who helped improve this platform

---

## 📞 Support

For questions, issues, or feature requests: 

1. Check the [existing documentation](#-additional-documentation)
2. Search [existing issues](https://github.com/hade148/StudyHub-IL/issues)
3. Create a [new issue](https://github.com/hade148/StudyHub-IL/issues/new) with detailed information

---

<div align="center">

**Built with ❤️ for Israeli Students**

[🏠 Homepage](https://github.com/hade148/StudyHub-IL) · [📖 Documentation](#-additional-documentation) · [🐛 Report Bug](https://github.com/hade148/StudyHub-IL/issues) · [✨ Request Feature](https://github.com/hade148/StudyHub-IL/issues)

</div>