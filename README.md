# ProjectFlow

ProjectFlow is a comprehensive project management application designed to help teams organize, track, and collaborate on projects efficiently.

## Features

- User authentication and authorization
- Project creation and management
- Task assignment and tracking
- Team collaboration tools
- Resource allocation and scheduling
- Dark/Light theme support

## Technology Stack

- **Backend**: Go (Golang)
- **Frontend**: React with TypeScript
- **Database**: PostgreSQL
- **Containerization**: Docker

## Getting Started with Docker

### Prerequisites

- Docker
- Docker Compose

### Installation and Setup

1. Clone the repository:
   ```
   git clone https://github.com/amorin24/projecflow.git
   cd projecflow
   ```

2. Start the application using Docker Compose:
   ```
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:8080

### Environment Variables

The application uses the following environment variables:

#### Backend
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port
- `DB_USER`: PostgreSQL user
- `DB_PASSWORD`: PostgreSQL password
- `DB_NAME`: PostgreSQL database name
- `SERVER_PORT`: Backend server port
- `JWT_SECRET`: Secret key for JWT tokens
- `ENV`: Environment (development/production)

#### Frontend
- `VITE_API_URL`: Backend API URL

## Development

### Running Locally (Without Docker)

#### Backend
1. Navigate to the backend directory:
   ```
   cd projectflow
   ```

2. Install dependencies:
   ```
   go mod download
   ```

3. Run the application:
   ```
   go run main.go
   ```

#### Frontend
1. Navigate to the frontend directory:
   ```
   cd projectflow-frontend/projectflow
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Testing

The application includes comprehensive test suites:

- Unit tests
- Integration tests
- End-to-end tests

To run tests:

```
# Backend tests
cd projectflow
go test ./...

# Frontend tests
cd projectflow-frontend/projectflow
npm test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
