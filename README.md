# StudyHub-IL Project Documentation

## Project Overview and Goals
StudyHub-IL is a comprehensive educational platform designed to facilitate learning through an interactive web interface. Our goal is to provide users with a seamless experience while accessing educational resources.

## Technology Stack
- **Frontend:** React 18 with TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend:** Node.js, Express
- **Database:** PostgreSQL with Prisma ORM

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

### Backend (Server)
1. Navigate to the server directory: `cd server`
2. Install dependencies: `npm install`
3. Set up environment variables:
   - Copy `.env.example` to `.env`: `cp .env.example .env`
   - Update `DATABASE_URL` with your PostgreSQL connection string
   - Update `JWT_SECRET` with a secure secret key
4. Generate Prisma client: `npx prisma generate`
5. Run database migrations: `npx prisma migrate dev`
6. Start the server: `npm start` (or `npm run dev` for development)

### With Docker
1. Clone the repository: `git clone <repository-url>`
2. Navigate to the project directory.
3. Run Docker Compose: `docker-compose up`

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
The project uses GitHub Actions for continuous integration and deployment.

## Contribution Guidelines
Contributions are welcome! Please submit a pull request with your changes.