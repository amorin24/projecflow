#!/bin/bash

# Script to update Docker configuration with latest code changes
# Usage: ./update_docker.sh [branch_name]

set -e

BRANCH=${1:-dev}

echo "Updating Docker configuration with latest code from branch: $BRANCH"

# Ensure we're in the repository root
cd "$(git rev-parse --show-toplevel)"

# Checkout the branch with latest code
git checkout $BRANCH

# Pull latest changes
git pull origin $BRANCH

# Checkout the Docker branch
git checkout devin/1741746327-docker-containerization

# Merge the latest changes from the specified branch
git merge $BRANCH -m "Merge latest changes from $BRANCH into Docker branch"

# Rebuild the Docker images
docker-compose build

echo "Docker configuration updated successfully!"
echo "Run 'docker-compose up -d' to start the updated containers"
