# ProjectFlow - Project Management Application

## Overview

ProjectFlow is a comprehensive project management application designed to help teams organize, track, and collaborate on projects efficiently. It enables project managers and team members to create and manage projects, assign tasks, allocate resources, and track progress through an intuitive interface.

## Documentation

All project documentation is available in the [docs](./docs) directory:

- [Documentation Index](./docs/README.md) - Start here for all documentation
- [Development Documentation](./docs/development) - Enhancement roadmap and branch management
- [Testing Documentation](./docs/testing) - Testing guides and contribution guidelines
- [Deployment Documentation](./docs/deployment) - Docker setup and deployment guides

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

## Features

### Project Management
- Create and manage projects with detailed tracking
- Assign and monitor tasks with status updates and comments
- Collaborative workspace with comments and file sharing
- Dashboard with project progress visualization

### Resource Management
- Allocate team members to projects with percentage-based assignments
- Track team member availability and manage time-off requests
- Resource utilization analytics and reporting

### User Experience
- Responsive design for desktop and mobile devices
- Light and dark theme support with smooth transitions
- Real-time notifications and updates
- Demo mode for exploring features without authentication

## Architecture

### Frontend
- React.js application with TypeScript
- Modern UI components with Tailwind CSS
- State management with React Context
- Performance optimizations with lazy loading and caching

### Backend
- Go (Golang) API server with RESTful endpoints
- JWT authentication and role-based access control
- Efficient database access with GORM
- Comprehensive API for all application features

### Database
- PostgreSQL for persistent data storage
- Structured schema with proper relationships
- Migrations for version control

## Getting Started

### Prerequisites
- Docker and Docker Compose for containerized deployment
- Node.js 18+ and npm/yarn for frontend development
- Go 1.21+ for backend development
- PostgreSQL 15 for database (or use the Docker container)

### Quick Start with Docker
```bash
# Clone the repository
git clone https://github.com/amorin24/projecflow.git
cd projecflow

# Start the application
docker-compose up -d

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8080/health
# Database: PostgreSQL on port 5432
```

### Local Development Setup
```bash
# Frontend development
cd projecflow
npm install
npm run dev

# Backend development
cd projecflow
go mod download
go run main.go
```

### Demo Mode
To explore the application without creating an account, visit:
```
http://localhost/demo
```

## Configuration

### Environment Variables
All configuration is managed through environment variables:

- `DB_HOST`: PostgreSQL host (default: postgres)
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_USER`: PostgreSQL user (default: postgres)
- `DB_PASSWORD`: PostgreSQL password (default: postgres)
- `DB_NAME`: PostgreSQL database name (default: projectflow)
- `SERVER_PORT`: Backend server port (default: 8080)
- `JWT_SECRET`: Secret key for JWT tokens
- `ENV`: Environment (development/production)

See [Docker Guide](./docs/deployment/DOCKER_GUIDE.md) for more details on configuration.

## Testing

The application includes comprehensive test suites:

```bash
# Run frontend tests
npm test

# Run backend tests
go test ./...

# Run end-to-end tests
npm run test:e2e
```

See [Testing Documentation](./docs/testing/OVERVIEW.md) for more details.

## Contributing

Contributions to ProjectFlow are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please review our [Contributing to Tests](./docs/testing/CONTRIBUTING_TO_TESTS.md) guide for details on our testing process.

## Troubleshooting

- If containers fail to start, check logs with `docker-compose logs`
- Ensure ports 80, 8080, and 5432 are not in use by other applications
- Verify that Docker and Docker Compose are installed correctly
- See [Docker Guide](./docs/deployment/DOCKER_GUIDE.md) for more troubleshooting tips

## License

This project is licensed under the MIT License - see the LICENSE file for details.
