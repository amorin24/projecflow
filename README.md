# ProjectFlow Docker Setup

This repository contains Docker configuration for running the ProjectFlow application.

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/amorin24/projecflow.git
   cd projecflow
   ```

2. Start the application:
   ```
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:8080

## Services

- **Frontend**: React application running on Nginx
- **Backend**: Go API server
- **Database**: PostgreSQL

## Environment Variables

### Backend
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port
- `DB_USER`: PostgreSQL user
- `DB_PASSWORD`: PostgreSQL password
- `DB_NAME`: PostgreSQL database name
- `SERVER_PORT`: Backend server port
- `JWT_SECRET`: Secret key for JWT tokens
- `ENV`: Environment (development/production)

### Frontend
- `VITE_API_URL`: Backend API URL

## Volumes

- `postgres_data`: Persistent storage for PostgreSQL data
