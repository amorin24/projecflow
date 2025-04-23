#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fixing Go import paths...${NC}"

# Find all Go files and fix import paths
find . -name "*.go" -type f -exec sed -i 's|"github.com/projectflow/|"github.com/amorin24/projecflow/|g' {} \;

echo -e "${GREEN}Import paths fixed!${NC}"

# Update go.mod and go.sum
echo -e "${YELLOW}Updating go.mod and go.sum...${NC}"
go mod tidy

echo -e "${GREEN}Go modules updated!${NC}"
