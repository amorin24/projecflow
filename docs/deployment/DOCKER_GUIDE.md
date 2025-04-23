# ProjectFlow Docker Guide

This guide provides comprehensive documentation for working with Docker in the ProjectFlow application.

## Docker Architecture Overview

ProjectFlow uses a three-tier architecture with Docker containers:

1. **Frontend Container**: Nginx serving the React application
2. **Backend Container**: Go API server
3. **Database Container**: PostgreSQL database

## Container Specifications

### Frontend Container
- **Base Image**: Nginx Alpine
- **Exposed Port**: 80
- **Volume Mounts**: Static assets from the build process
- **Dependencies**: Backend API for data

### Backend Container
- **Base Image**: Go Alpine
- **Exposed Port**: 8080
- **Environment Variables**: Database connection, JWT settings
- **Dependencies**: PostgreSQL database

### Database Container
- **Base Image**: PostgreSQL 15 Alpine
- **Exposed Port**: 5432
- **Volume Mounts**: Persistent data storage
- **Environment Variables**: Database credentials

## Getting Started with Docker

### Prerequisites
- Docker Engine (20.10.0+)
- Docker Compose (2.0.0+)
- Git

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/amorin24/projecflow.git
   cd projecflow
   ```

2. Start the application:
   ```bash
   docker-compose up -d
   ```

3. Verify the containers are running:
   ```bash
   docker-compose ps
   ```

4. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:8080/health
   - Database: PostgreSQL on port 5432

## Development Workflow

### Building Images

Build all images:
```bash
docker-compose build
```

Build a specific service:
```bash
docker-compose build frontend
docker-compose build backend
```

### Running in Development Mode

Run with logs in the foreground:
```bash
docker-compose up
```

Run in detached mode:
```bash
docker-compose up -d
```

### Viewing Logs

View logs for all services:
```bash
docker-compose logs -f
```

View logs for a specific service:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stopping Containers

Stop all containers:
```bash
docker-compose down
```

Stop and remove volumes:
```bash
docker-compose down -v
```

## Container Testing

### Frontend Container Testing

1. Verify static content serving:
   ```bash
   curl http://localhost
   ```

2. Check Nginx configuration:
   ```bash
   docker-compose exec frontend nginx -t
   ```

3. Verify frontend-backend communication:
   ```bash
   # Check network connectivity
   docker-compose exec frontend ping backend
   
   # Check API access
   curl http://localhost/api/health
   ```

### Backend Container Testing

1. Check health endpoint:
   ```bash
   curl http://localhost:8080/health
   ```

2. Verify database connectivity:
   ```bash
   docker-compose exec backend go run ./cmd/dbcheck
   ```

3. Test API endpoints:
   ```bash
   curl http://localhost:8080/api/projects
   ```

### Database Container Testing

1. Connect to the database:
   ```bash
   docker-compose exec postgres psql -U postgres -d projectflow
   ```

2. Verify data persistence:
   ```bash
   # Create test data
   docker-compose exec postgres psql -U postgres -d projectflow -c "INSERT INTO test_table (name) VALUES ('test');"
   
   # Restart container
   docker-compose restart postgres
   
   # Verify data still exists
   docker-compose exec postgres psql -U postgres -d projectflow -c "SELECT * FROM test_table;"
   ```

## Environment Variables

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:8080` |
| `REACT_APP_ENV` | Environment | `development` |

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `postgres` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `DB_NAME` | PostgreSQL database name | `projectflow` |
| `SERVER_PORT` | Backend server port | `8080` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `ENV` | Environment | `development` |

### Database Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | PostgreSQL user | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `postgres` |
| `POSTGRES_DB` | PostgreSQL database name | `projectflow` |

## Docker Compose Profiles

ProjectFlow supports different Docker Compose profiles for various scenarios:

### Development Profile

```bash
docker-compose --profile dev up
```

Features:
- Hot reloading for frontend
- Debug mode for backend
- Development database with sample data

### Production Profile

```bash
docker-compose --profile prod up
```

Features:
- Optimized frontend build
- Production-ready backend
- Database with backups enabled

### Testing Profile

```bash
docker-compose --profile test up
```

Features:
- Test environment setup
- Isolated test database
- Mock services for external dependencies

## Custom Docker Commands

### Database Backup

```bash
docker-compose exec postgres pg_dump -U postgres -d projectflow > backup.sql
```

### Database Restore

```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres -d projectflow
```

### Running Migrations

```bash
docker-compose exec backend go run ./cmd/migrate
```

## Troubleshooting

### Common Issues

1. **Container fails to start**
   - Check logs: `docker-compose logs <service>`
   - Verify port availability: `netstat -tuln`
   - Check disk space: `df -h`

2. **Database connection issues**
   - Verify environment variables
   - Check network connectivity: `docker network inspect projecflow_default`
   - Ensure database initialization completed

3. **Frontend cannot connect to backend**
   - Check API URL configuration
   - Verify network connectivity between containers
   - Check for CORS issues in browser console

### Debugging Containers

Access a running container:
```bash
docker-compose exec <service> sh
```

View container details:
```bash
docker inspect <container_id>
```

Check container resource usage:
```bash
docker stats
```

## Best Practices

1. **Security**
   - Never hardcode secrets in Dockerfiles
   - Use environment variables for sensitive information
   - Regularly update base images for security patches

2. **Performance**
   - Use multi-stage builds to reduce image size
   - Leverage Docker layer caching
   - Optimize Dockerfile instructions order

3. **Development Workflow**
   - Use volumes for development to avoid rebuilding
   - Implement hot reloading where possible
   - Use Docker Compose for local development

4. **CI/CD Integration**
   - Build and test images in CI pipeline
   - Tag images with git commit SHA
   - Use registry for image storage

## Advanced Topics

### Custom Nginx Configuration

The frontend container uses a custom Nginx configuration for routing:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Docker Network Configuration

ProjectFlow uses a custom Docker network for container communication:

```yaml
networks:
  projectflow:
    driver: bridge
```

### Volume Management

ProjectFlow uses named volumes for data persistence:

```yaml
volumes:
  postgres_data:
    driver: local
```

## Updating Docker Configuration

When adding new features to ProjectFlow, update the Docker configuration:

1. Update Dockerfiles if new dependencies are added
2. Modify docker-compose.yml for new services or configuration
3. Update environment variables for new features
4. Test the Docker setup thoroughly before committing changes

## Docker Cheat Sheet

```bash
# Build and start containers
docker-compose up -d --build

# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Execute command in container
docker-compose exec <service> <command>

# Rebuild a specific service
docker-compose up -d --build <service>

# View container resource usage
docker stats

# Clean up unused resources
docker system prune
```
