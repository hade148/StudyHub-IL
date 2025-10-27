# StudyHub-IL Project Documentation

## Project Overview and Goals
StudyHub-IL is a comprehensive educational platform designed to facilitate learning through an interactive web interface. Our goal is to provide users with a seamless experience while accessing educational resources.

## Technology Stack
- **Frontend:** React
- **Backend:** Node.js, Express
- **Database:** PostgreSQL with Prisma ORM

## Project Structure
- **/client:** Contains the React frontend
- **/server:** Contains the Node.js backend
- **/docker:** Contains Docker configurations

## Installation Instructions with Docker
1. Clone the repository: `git clone <repository-url>`
2. Navigate to the project directory.
3. Run Docker Compose: `docker-compose up`

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
- **GET /api/courses:** Retrieve all courses
- **POST /api/enroll:** Enroll a user in a course

## Testing Instructions
Run tests using Jest: `npm test`

## CI/CD Information
The project uses GitHub Actions for continuous integration and deployment.

## Contribution Guidelines
Contributions are welcome! Please submit a pull request with your changes.