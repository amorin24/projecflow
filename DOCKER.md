# ProjectFlow Docker Documentation

## Overview

This document provides detailed information about the Docker setup for the ProjectFlow application. The Docker configuration allows you to run the complete application stack (frontend, backend, and database) with a single command.

## Architecture

The Docker setup consists of three main services:

1. **Frontend**: A React.js application served by Nginx
2. **Backend**: A Go HTTP server providing API endpoints
3. **Database**: PostgreSQL for data storage

### Container Communication

The containers communicate with each other through a Docker network:
- Frontend → Backend: HTTP requests to `http://backend:8080`
- Backend → Database: PostgreSQL connection to `postgres:5432`

## Prerequisites

- Docker Engine (version 20.10.0 or higher)
- Docker Compose (version 2.0.0 or higher)

## Getting Started

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

## Configuration

### Environment Variables

The Docker setup uses environment variables defined in the `docker-compose.yml` file:

#### Backend
- `DB_HOST`: PostgreSQL host (default: postgres)
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_USER`: PostgreSQL user (default: postgres)
- `DB_PASSWORD`: PostgreSQL password (default: postgres)
- `DB_NAME`: PostgreSQL database name (default: projectflow)
- `SERVER_PORT`: Backend server port (default: 8080)
- `JWT_SECRET`: Secret key for JWT tokens
- `ENV`: Environment (development/production)

### Volumes

- `postgres_data`: Persistent storage for PostgreSQL data

## Development Workflow

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

## Updating Docker with Latest Code Changes

To update the Docker configuration with the latest code changes:

1. Use the provided script:
   ```bash
   ./update_docker.sh [branch_name]
   ```
   
   This script will:
   - Checkout the specified branch (defaults to `dev`)
   - Pull the latest changes
   - Merge those changes into the Docker branch
   - Rebuild the Docker images

2. Alternatively, you can manually update:
   ```bash
   git checkout dev  # or any other branch with latest changes
   git pull
   git checkout devin/1741746327-docker-containerization
   git merge dev
   docker-compose build
   docker-compose up -d
   ```

## Troubleshooting

### Common Issues

1. **Container fails to start**
   - Check logs: `docker-compose logs [service_name]`
   - Verify port availability: Ensure ports 80, 8080, and 5432 are not in use

2. **Database connection issues**
   - Check database logs: `docker-compose logs postgres`
   - Verify environment variables in `docker-compose.yml`

3. **Frontend cannot connect to backend**
   - Check CORS configuration in backend
   - Verify network connectivity between containers

### Debugging

For more detailed debugging:

```bash
# Enter a running container
docker-compose exec [service_name] sh

# View container details
docker inspect [container_id]

# Check network connectivity
docker-compose exec backend ping postgres
```

## Best Practices

1. Always use the Docker branch for Docker-related changes
2. Keep the Docker branch updated with the latest code changes
3. Test Docker configuration locally before pushing changes
4. Document any changes to the Docker configuration
