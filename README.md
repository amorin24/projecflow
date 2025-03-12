# ProjectFlow - Docker Setup

## Overview

ProjectFlow is a comprehensive project management application designed to help teams organize, track, and collaborate on projects efficiently. This repository contains the Docker configuration for running the complete application stack.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/amorin24/projecflow.git
   cd projecflow
   ```

2. Start the application:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:8080/health
   - Database: PostgreSQL on port 5432

## Services

### Frontend
- React.js application with TypeScript
- Served via Nginx on port 80
- Features:
  - Project management interface
  - Task tracking and assignment
  - User authentication
  - Resource allocation
  - Light and dark theme support

### Backend
- Go (Golang) API server
- RESTful endpoints for application data
- JWT authentication
- Running on port 8080

### Database
- PostgreSQL 15
- Persistent data storage
- Running on port 5432

## Environment Variables

### Backend
- `DB_HOST`: PostgreSQL host (default: postgres)
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_USER`: PostgreSQL user (default: postgres)
- `DB_PASSWORD`: PostgreSQL password (default: postgres)
- `DB_NAME`: PostgreSQL database name (default: projectflow)
- `SERVER_PORT`: Backend server port (default: 8080)
- `JWT_SECRET`: Secret key for JWT tokens
- `ENV`: Environment (development/production)

## Development

### Building Images
```bash
docker-compose build
```

### Running in Development Mode
```bash
docker-compose up
```

### Viewing Logs
```bash
docker-compose logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

### Stopping the Application
```bash
docker-compose down
```

## Testing

To test the application:

1. Check if the backend is running:
   ```bash
   curl http://localhost:8080/health
   ```

2. Access the frontend in your browser:
   ```
   http://localhost
   ```

## Troubleshooting

- If containers fail to start, check logs with `docker-compose logs`
- Ensure ports 80, 8080, and 5432 are not in use by other applications
- Verify that Docker and Docker Compose are installed correctly

## License

MIT
