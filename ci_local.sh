#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting local CI checks...${NC}"

# Function to print section headers
section() {
  echo -e "\n${YELLOW}==== $1 ====${NC}"
}

# Function to handle errors
handle_error() {
  echo -e "${RED}ERROR: $1${NC}"
  exit 1
}

# Check if we're in the root directory of the project
if [ ! -f "package.json" ] || [ ! -f "go.mod" ]; then
  handle_error "Please run this script from the root directory of the project"
fi

# Frontend checks
section "Frontend Checks"

echo "Installing frontend dependencies..."
npm install || handle_error "Failed to install frontend dependencies"

echo "Running ESLint..."
npm run lint || handle_error "ESLint check failed"

echo "Running frontend tests..."
npm test || handle_error "Frontend tests failed"

echo "Building frontend..."
npm run build || handle_error "Frontend build failed"

echo -e "${GREEN}Frontend checks passed!${NC}"

# Backend checks
section "Backend Checks"

echo "Downloading Go dependencies..."
go mod download || handle_error "Failed to download Go dependencies"

echo "Running Go tests..."
go test ./... || handle_error "Go tests failed"

echo "Building Go application..."
go build || handle_error "Go build failed"

echo -e "${GREEN}Backend checks passed!${NC}"

# Docker checks
section "Docker Checks"

if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
  echo "Building Docker images..."
  docker-compose build || handle_error "Docker build failed"
  
  echo "Starting Docker containers..."
  docker-compose up -d || handle_error "Failed to start Docker containers"
  
  echo "Waiting for containers to be ready..."
  sleep 10
  
  echo "Checking container status..."
  docker-compose ps
  
  echo "Stopping Docker containers..."
  docker-compose down
  
  echo -e "${GREEN}Docker checks passed!${NC}"
else
  echo -e "${YELLOW}WARNING: Docker or docker-compose not found, skipping Docker checks${NC}"
fi

# All checks passed
echo -e "\n${GREEN}All CI checks passed! You can now push your changes.${NC}"

# Create a git push wrapper script
cat > safe_push.sh << 'EOF'
#!/bin/bash
set -e

# Run CI checks first
./ci_local.sh

# If CI checks pass, push to GitHub
echo "Pushing changes to GitHub..."
git push $@

echo "Changes successfully pushed to GitHub!"
EOF

chmod +x safe_push.sh

echo -e "\n${YELLOW}A 'safe_push.sh' script has been created.${NC}"
echo -e "Use ${GREEN}./safe_push.sh${NC} instead of ${RED}git push${NC} to automatically run CI checks before pushing."
