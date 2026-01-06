# StudyHub-IL Project Documentation

## Project Overview and Goals
StudyHub-IL is a comprehensive educational platform designed to facilitate learning through an interactive web interface. Our goal is to provide users with a seamless experience while accessing educational resources.

## Technology Stack
- **Frontend:** React 18 with TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend:** Node.js, Express
- **Database:** PostgreSQL with Prisma ORM (Local and Azure PostgreSQL Flexible Server support)

## Project Structure
- **/client:** Contains the React TypeScript frontend with modern UI components
- **/server:** Contains the Node.js backend
- **/docker:** Contains Docker configurations

## Installation Instructions

### Prerequisites
- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **PostgreSQL** 14.x or higher (for backend)
- **Git**

### Frontend (Client)
1. Navigate to the client directory: `cd client`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Build for production: `npm run build`

npx prisma db push
npx prisma generate
npm run seed

   Admin: admin@studyhub.local / password123        
   Student: student@studyhub.local / password123   

### Backend (Server)
1. Navigate to the server directory: `cd server`
2. Install dependencies: `npm install`
3. Set up environment variables:
   - Copy `.env.example` to `.env`: `cp .env.example .env`
   - **Local Development:** Update `DATABASE_URL` with your local PostgreSQL connection string
   - **Azure PostgreSQL:** Use Azure connection string with `sslmode=require` parameter
   - Update `JWT_SECRET` with a secure secret key
   - Configure other environment variables as needed
4. Generate Prisma client: `npx prisma generate`
5. Run database migrations: 
   - Development: `npx prisma migrate dev`
   - Production: `npx prisma migrate deploy`
   - Quick sync (if encountering schema errors): Run `./sync-database.sh` (Linux/Mac) or `sync-database.bat` (Windows)
6. Test database connection: `npm run db:test-connection`
7. Start the server: `npm start` (or `npm run dev` for development)

**Note:** If you encounter login errors about missing columns (e.g., "The column `users.bio` does not exist"), your database schema is out of sync. Run the sync script: `./sync-database.sh` (Linux/Mac) or `sync-database.bat` (Windows). See [DATABASE_MIGRATION.md](DATABASE_MIGRATION.md) for details.

### With Docker
1. Clone the repository: `git clone <repository-url>`
2. Navigate to the project directory.
3. Run Docker Compose: `docker-compose up`

## Azure PostgreSQL Setup

The application supports both local PostgreSQL and Azure Database for PostgreSQL Flexible Server.

### Environment Configuration

**Local Development:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/studyhub"
```

**Azure PostgreSQL (Development):**
```env
DATABASE_URL="postgresql://dbadmin:PASSWORD@studyhub-db.postgres.database.azure.com:5432/studyhub_dev?sslmode=require"
```

**Azure PostgreSQL (Staging):**
```env
DATABASE_URL_STAGING="postgresql://dbadmin:PASSWORD@studyhub-db.postgres.database.azure.com:5432/studyhub_staging?sslmode=require"
```

**Azure PostgreSQL (Production):**
```env
DATABASE_URL_PRODUCTION="postgresql://dbadmin:PASSWORD@studyhub-db.postgres.database.azure.com:5432/studyhub_prod?sslmode=require"
```

### Important Notes

- **SSL Required:** Azure PostgreSQL connections must include `sslmode=require` parameter
- **Firewall Configuration:** Ensure your IP address is allowed in Azure PostgreSQL firewall rules
- **Secure Credentials:** Never commit actual passwords. Use Azure Key Vault or environment variables
- **Database Scripts:** Use `npm run db:test-connection` to verify connectivity

### Detailed Setup Guide

For comprehensive database setup instructions, including:
- Local PostgreSQL installation and configuration
- Azure PostgreSQL setup and firewall configuration
- Running Prisma migrations in different environments
- Troubleshooting connection issues
- SSL/TLS configuration details

See: **[server/docs/DATABASE_SETUP.md](server/docs/DATABASE_SETUP.md)**

## Features
- 🎨 Modern, responsive UI with RTL (Right-to-Left) Hebrew support
- 🔐 Complete authentication system (Login, Register, Password Reset)
- 📚 Summaries management and upload
- 💬 Forum for questions and discussions
- 🛠️ Educational tools
- 👤 User profiles with statistics and achievements
- 🎯 Protected routes with authentication

## Database Schema
The database consists of the following 8 tables:
1. Users
2. Courses
3. Enrollments
4. Lessons
5. Quizzes
6. Questions
7. Answers
8. Feedback

## API Endpoints Documentation

### Authentication
- **POST /api/auth/register:** Register a new user
  - Body: `{ fullName, email, password }`
  - Returns: `{ message, token, user }`
- **POST /api/auth/login:** Login with email and password
  - Body: `{ email, password }`
  - Returns: `{ message, token, user }`
- **GET /api/auth/me:** Get current authenticated user (requires Bearer token)
  - Headers: `Authorization: Bearer <token>`
  - Returns: User object with statistics

### Other Endpoints
- **GET /api/courses:** Retrieve all courses
- **POST /api/enroll:** Enroll a user in a course

## Testing Instructions
Run tests using Jest: `npm test`

## CI/CD Information
The project uses Azure DevOps Pipelines for continuous integration and deployment with:
- Automated builds and tests
- Environment-specific deployments (Development, Staging, Production)
- Automated Prisma database migrations for each environment
- Azure PostgreSQL database integration

See [AZURE_PIPELINE_GUIDE.md](AZURE_PIPELINE_GUIDE.md) for detailed pipeline documentation.

## Contribution Guidelines
Contributions are welcome! Please submit a pull request with your changes.