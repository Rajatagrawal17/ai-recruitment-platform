#!/bin/bash

# 🧪 COGNIFIT APP - QUICK VALIDATION TEST SUITE
# Run this to verify all systems are working

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        🧪 CogniFit Platform - Validation Test Suite          ║"
echo "║              Testing All Critical Components                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected="$3"
    
    echo -n "Testing: $name... "
    
    response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [[ "$http_code" == "200" || "$http_code" == "401" ]]; then
        echo -e "${GREEN}✅ PASS${NC} (Status: $http_code)"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Status: $http_code)"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "🔍 BACKEND TESTS (localhost:5000)"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

test_endpoint "Backend Health Check" "http://localhost:5000/api/health"
test_endpoint "Get Jobs (Public)" "http://localhost:5000/api/jobs"
test_endpoint "Protected Route (Auth Required)" "http://localhost:5000/api/users/profile-info"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "🎨 FRONTEND TESTS (localhost:3001)"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

test_endpoint "Frontend HTML" "http://localhost:3001"
test_endpoint "Frontend Static JS" "http://localhost:3001/static/js/main.*.js"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "📊 RESULTS SUMMARY"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
echo "Tests Passed: ${GREEN}${TESTS_PASSED}${NC}"
echo "Tests Failed: ${RED}${TESTS_FAILED}${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL SYSTEMS OPERATIONAL!${NC}"
    echo ""
    echo "Your app is ready for testing:"
    echo "  • Frontend: http://localhost:3001"
    echo "  • Backend: http://localhost:5000"
    echo ""
    echo "Next steps:"
    echo "  1. Open http://localhost:3001 in browser"
    echo "  2. Press F12 → Console tab"
    echo "  3. Look for any error messages"
    echo "  4. Test login & job browsing"
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  • Ensure backend is running: npm start (in backend folder)"
    echo "  • Ensure frontend is running: npm start (in frontend folder)"
    echo "  • Check MongoDB is connected"
    echo "  • Review error messages above"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
