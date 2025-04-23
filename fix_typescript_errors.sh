#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fixing TypeScript errors...${NC}"

# Fix TimeOffRequestForm.tsx export
if [ -f "src/components/TimeOffRequestForm.tsx" ]; then
  echo "Fixing TimeOffRequestForm.tsx export..."
  sed -i 's/export default function TimeOffRequestForm/export function TimeOffRequestForm/' src/components/TimeOffRequestForm.tsx
fi

# Fix UserAvailabilityForm.tsx export
if [ -f "src/components/UserAvailabilityForm.tsx" ]; then
  echo "Fixing UserAvailabilityForm.tsx export..."
  sed -i 's/export default function UserAvailabilityForm/export function UserAvailabilityForm/' src/components/UserAvailabilityForm.tsx
fi

# Fix TimeOffRequests.tsx type issues
if [ -f "src/pages/TimeOffRequests.tsx" ]; then
  echo "Fixing TimeOffRequests.tsx type issues..."
  sed -i 's/const \[requests, setRequests\] = useState(\[\]);/const \[requests, setRequests\] = useState<{id: number; user: string; startDate: string; endDate: string; status: string;}[]>(\[\]);/' src/pages/TimeOffRequests.tsx
fi

# Fix UserAvailability.tsx type issues
if [ -f "src/pages/UserAvailability.tsx" ]; then
  echo "Fixing UserAvailability.tsx type issues..."
  sed -i 's/const \[users, setUsers\] = useState(\[\]);/const \[users, setUsers\] = useState<{id: number; name: string; availability: number; projects: string[];}[]>(\[\]);/' src/pages/UserAvailability.tsx
fi

# Fix ResourceManagement.tsx getUsers import
if [ -f "src/pages/ResourceManagement.tsx" ]; then
  echo "Fixing ResourceManagement.tsx getUsers import..."
  sed -i 's/import { getUsers, getProjects } from/import { getProjects } from/' src/pages/ResourceManagement.tsx
  sed -i '/getProjects/a\// Mock getUsers function until API is implemented\nconst getUsers = async () => {\n  return [\n    { id: "1", full_name: "John Doe", email: "john@example.com" },\n    { id: "2", full_name: "Jane Smith", email: "jane@example.com" },\n  ];\n};' src/pages/ResourceManagement.tsx
fi

echo -e "${GREEN}TypeScript errors fixed!${NC}"
