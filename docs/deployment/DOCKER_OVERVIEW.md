# Docker Configuration for ProjectFlow

This directory contains Docker configuration files for running the ProjectFlow application in containers.

## Files

- `docker-compose.yml`: Main Docker Compose configuration file for the complete application
- `docker-compose.frontend.yml`: Configuration for testing just the frontend container
- `frontend.Dockerfile`: Dockerfile for building the React frontend
- `nginx.conf`: Nginx configuration for the frontend container with backend API proxy
- `nginx.test.conf`: Nginx configuration for standalone frontend testing

## Environment Variables

The Docker setup supports the following environment variables:

### Frontend
- `VITE_API_URL`: Backend API URL
- `VITE_ADMIN_EMAIL`, `VITE_ADMIN_PASSWORD`: Admin test credentials
- `VITE_MANAGER_EMAIL`, `VITE_MANAGER_PASSWORD`: Manager test credentials
- `VITE_DEVELOPER_EMAIL`, `VITE_DEVELOPER_PASSWORD`: Developer test credentials
- `VITE_VIEWER_EMAIL`, `VITE_VIEWER_PASSWORD`: Viewer test credentials

### Backend
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port
- `DB_USER`: PostgreSQL user
- `DB_PASSWORD`: PostgreSQL password
- `DB_NAME`: PostgreSQL database name
- `SERVER_PORT`: Backend server port
- `JWT_SECRET`: Secret key for JWT tokens
- `ENV`: Environment (development/production)
- `ALLOWED_ORIGINS`: CORS allowed origins

## Usage

### Running the Complete Application

```bash
# Build and start all containers
docker-compose -f .docker/docker-compose.yml up -d

# View logs
docker-compose -f .docker/docker-compose.yml logs

# Stop containers
docker-compose -f .docker/docker-compose.yml down
```

### Testing Just the Frontend

```bash
# Build and start just the frontend container
docker-compose -f .docker/docker-compose.frontend.yml up -d

# View logs
docker-compose -f .docker/docker-compose.frontend.yml logs

# Stop container
docker-compose -f .docker/docker-compose.frontend.yml down
```

## Testing

To test the Docker setup:

1. Create a `.env` file based on `.env.example`
2. Build and start the containers
3. Access the frontend at http://localhost
4. Verify the test credentials display component works correctly
5. Verify the theme toggle functionality works
