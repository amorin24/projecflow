#!/bin/bash

# Branch Cleanup Script
# This script deletes branches that have been identified for removal in BRANCH_CLEANUP.md

echo "Branch Cleanup Script"
echo "====================="
echo "This script will delete the following branches:"
echo "1. origin/devin/1745349135-dummy-change (merged into dev)"
echo "2. origin/devin/1741636602-theme-support (superseded by newer theme branch)"
echo "3. origin/devin/1741836482-docker-update (merged into latest Docker config)"
echo "4. origin/devin/1741787994-docker-update (superseded by newer Docker updates)"
echo "5. origin/devin/1741746327-docker-containerization (superseded by newer Docker updates)"
echo "6. origin/devin/1741718145-resource-management (superseded by newer resource management)"
echo "7. origin/devin/1741785431-ui-and-test-data (merged into main)"
echo "8. origin/devin/1741721195-tech-debt-cleanup (superseded by newer optimization branch)"
echo ""
echo "Please review BRANCH_CLEANUP.md for the full analysis."
echo ""

# Delete branches
git push origin --delete devin/1745349135-dummy-change
git push origin --delete devin/1741636602-theme-support
git push origin --delete devin/1741836482-docker-update
git push origin --delete devin/1741787994-docker-update
git push origin --delete devin/1741746327-docker-containerization
git push origin --delete devin/1741718145-resource-management
git push origin --delete devin/1741785431-ui-and-test-data
git push origin --delete devin/1741721195-tech-debt-cleanup

echo "Branch cleanup complete."
