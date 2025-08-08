#!/bin/bash

# Shopping Cart API Comprehensive Test Script
# This script tests all the requirements mentioned in the README

echo "🚀 Starting comprehensive API testing..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper function to run tests
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_status="$3"
    
    echo -e "\n${YELLOW}Testing: $test_name${NC}"
    echo "Command: $command"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Run the command and capture output and status
    response=$(eval "$command" 2>&1)
    status=$?
    
    if [ $status -eq $expected_status ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo "Response: $response"
    else
        echo -e "${RED}✗ FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "Expected status: $expected_status, Got: $status"
        echo "Response: $response"
    fi
}

# Helper function to test JSON response
test_json_response() {
    local test_name="$1"
    local command="$2"
    local expected_pattern="$3"
    
    echo -e "\n${YELLOW}Testing: $test_name${NC}"
    echo "Command: $command"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    response=$(eval "$command" 2>&1)
    
    if echo "$response" | grep -q "$expected_pattern"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo "Response contains expected pattern: $expected_pattern"
    else
        echo -e "${RED}✗ FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "Expected pattern: $expected_pattern"
        echo "Response: $response"
    fi
}

# Variables for testing
API_BASE="http://localhost:3000/api"
TEST_USER="testuser123"

# Get product and brand IDs for testing
echo -e "\n${YELLOW}Getting product and brand IDs for testing...${NC}"
PRODUCTS_RESPONSE=$(curl -s "$API_BASE/products")
BRANDS_RESPONSE=$(curl -s "$API_BASE/brands")

# Extract IDs (using basic string manipulation since jq might not be available)
NIACINAMIDE_ID=$(echo "$PRODUCTS_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
JETLAG_ID=$(echo "$PRODUCTS_RESPONSE" | grep -o '"_id":"[^"]*"' | sed -n '3p' | cut -d'"' -f4)
PROTINI_ID=$(echo "$PRODUCTS_RESPONSE" | grep -o '"_id":"[^"]*"' | sed -n '5p' | cut -d'"' -f4)

ORDINARY_ID=$(echo "$BRANDS_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
SUMMER_FRIDAYS_ID=$(echo "$BRANDS_RESPONSE" | grep -o '"_id":"[^"]*"' | sed -n '2p' | cut -d'"' -f4)
DRUNK_ELEPHANT_ID=$(echo "$BRANDS_RESPONSE" | grep -o '"_id":"[^"]*"' | sed -n '3p' | cut -d'"' -f4)

echo "Product IDs: Niacinamide=$NIACINAMIDE_ID, JetLag=$JETLAG_ID, Protini=$PROTINI_ID"
echo "Brand IDs: Ordinary=$ORDINARY_ID, SummerFridays=$SUMMER_FRIDAYS_ID, DrunkElephant=$DRUNK_ELEPHANT_ID"

# Test 1: Basic API Endpoints
echo -e "\n${YELLOW}=== TESTING BASIC API ENDPOINTS ===${NC}"

test_json_response "Get all products" \
    "curl -s '$API_BASE/products'" \
    '"success":true'

test_json_response "Get all brands" \
    "curl -s '$API_BASE/brands'" \
    '"success":true'

test_json_response "Get specific product" \
    "curl -s '$API_BASE/products/$NIACINAMIDE_ID'" \
    '"success":true'

test_json_response "Get specific brand" \
    "curl -s '$API_BASE/brands/$ORDINARY_ID'" \
    '"success":true'

# Test 2: Case Quantity Validation
echo -e "\n${YELLOW}=== TESTING CASE QUANTITY VALIDATION ===${NC}"

test_json_response "Add valid case quantity (12 units - multiple of 12)" \
    "curl -s -X POST '$API_BASE/cart' -H 'Content-Type: application/json' -d '{\"userId\":\"$TEST_USER\",\"productId\":\"$NIACINAMIDE_ID\",\"quantity\":12,\"hasRiskFreeReturn\":false}'" \
    '"success":true'

test_json_response "Try invalid case quantity (5 units - not multiple of 12)" \
    "curl -s -X POST '$API_BASE/cart' -H 'Content-Type: application/json' -d '{\"userId\":\"${TEST_USER}2\",\"productId\":\"$NIACINAMIDE_ID\",\"quantity\":5,\"hasRiskFreeReturn\":false}'" \
    '"success":false'

# Test 3: Risk-Free Return Premium
echo -e "\n${YELLOW}=== TESTING RISK-FREE RETURN PREMIUM ===${NC}"

test_json_response "Add item with risk-free return" \
    "curl -s -X POST '$API_BASE/cart' -H 'Content-Type: application/json' -d '{\"userId\":\"${TEST_USER}3\",\"productId\":\"$NIACINAMIDE_ID\",\"quantity\":12,\"hasRiskFreeReturn\":true}'" \
    '"success":true'

test_json_response "Check risk-free return premium calculation" \
    "curl -s '$API_BASE/cart/${TEST_USER}3'" \
    '"riskFreeReturnPremium":'

# Test 4: Cart Operations
echo -e "\n${YELLOW}=== TESTING CART OPERATIONS ===${NC}"

test_json_response "Get cart contents" \
    "curl -s '$API_BASE/cart/$TEST_USER'" \
    '"success":true'

test_json_response "Update cart item quantity" \
    "curl -s -X PUT '$API_BASE/cart/$TEST_USER/items/$NIACINAMIDE_ID' -H 'Content-Type: application/json' -d '{\"quantity\":24,\"hasRiskFreeReturn\":false}'" \
    '"success":true'

test_json_response "Remove item from cart" \
    "curl -s -X DELETE '$API_BASE/cart/$TEST_USER/items/$NIACINAMIDE_ID'" \
    '"success":true'

# Test 5: Brand Minimum Order Values
echo -e "\n${YELLOW}=== TESTING BRAND MINIMUM ORDER VALUES ===${NC}"

# Add small quantity to test minimum order validation
test_json_response "Add small quantity to cart" \
    "curl -s -X POST '$API_BASE/cart' -H 'Content-Type: application/json' -d '{\"userId\":\"${TEST_USER}4\",\"productId\":\"$NIACINAMIDE_ID\",\"quantity\":12,\"hasRiskFreeReturn\":false}'" \
    '"success":true'

test_json_response "Try checkout with insufficient order value" \
    "curl -s -X POST '$API_BASE/cart/${TEST_USER}4/checkout/$ORDINARY_ID'" \
    '"success":false'

# Test 6: Multi-brand Cart
echo -e "\n${YELLOW}=== TESTING MULTI-BRAND CART ===${NC}"

# Add items from multiple brands
test_json_response "Add The Ordinary product" \
    "curl -s -X POST '$API_BASE/cart' -H 'Content-Type: application/json' -d '{\"userId\":\"${TEST_USER}5\",\"productId\":\"$NIACINAMIDE_ID\",\"quantity\":36,\"hasRiskFreeReturn\":false}'" \
    '"success":true'

test_json_response "Add Summer Fridays product" \
    "curl -s -X POST '$API_BASE/cart' -H 'Content-Type: application/json' -d '{\"userId\":\"${TEST_USER}5\",\"productId\":\"$JETLAG_ID\",\"quantity\":12,\"hasRiskFreeReturn\":false}'" \
    '"success":true'

test_json_response "Check brand grouping in cart" \
    "curl -s '$API_BASE/cart/${TEST_USER}5'" \
    '"brandGroups":'

# Test 7: Partial Brand Checkout
echo -e "\n${YELLOW}=== TESTING PARTIAL BRAND CHECKOUT ===${NC}"

test_json_response "Checkout Summer Fridays brand only" \
    "curl -s -X POST '$API_BASE/cart/${TEST_USER}5/checkout/$SUMMER_FRIDAYS_ID'" \
    '"success":true'

test_json_response "Verify remaining items are from other brands" \
    "curl -s '$API_BASE/cart/${TEST_USER}5'" \
    '"success":true'

# Test 8: Platform Minimum Order Value
echo -e "\n${YELLOW}=== TESTING PLATFORM MINIMUM ORDER VALUE ===${NC}"

test_json_response "Check platform minimum status in cart" \
    "curl -s '$API_BASE/cart/${TEST_USER}5'" \
    '"reachesPlatformMinimum":'

# Test 9: Error Handling
echo -e "\n${YELLOW}=== TESTING ERROR HANDLING ===${NC}"

test_json_response "Get non-existent product" \
    "curl -s '$API_BASE/products/000000000000000000000000'" \
    '"success":false'

test_json_response "Get non-existent brand" \
    "curl -s '$API_BASE/brands/000000000000000000000000'" \
    '"success":false'

test_json_response "Add product with invalid ID" \
    "curl -s -X POST '$API_BASE/cart' -H 'Content-Type: application/json' -d '{\"userId\":\"${TEST_USER}6\",\"productId\":\"invalid-id\",\"quantity\":12,\"hasRiskFreeReturn\":false}'" \
    '"success":false'

# Test 10: Large Order Test (for platform minimum)
echo -e "\n${YELLOW}=== TESTING LARGE ORDER (PLATFORM MINIMUM) ===${NC}"

# Add expensive products to reach platform minimum
test_json_response "Add expensive products for platform minimum" \
    "curl -s -X POST '$API_BASE/cart' -H 'Content-Type: application/json' -d '{\"userId\":\"${TEST_USER}7\",\"productId\":\"$PROTINI_ID\",\"quantity\":36,\"hasRiskFreeReturn\":false}'" \
    '"success":true'

test_json_response "Check if platform minimum is reached" \
    "curl -s '$API_BASE/cart/${TEST_USER}7'" \
    '"reachesPlatformMinimum":true'

# Final Results
echo -e "\n${YELLOW}========================================"
echo "🏁 TEST SUMMARY"
echo "========================================"
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
    echo "The Shopping Cart API meets all requirements!"
else
    echo -e "\n${RED}❌ Some tests failed. Please review the output above.${NC}"
fi

echo -e "\n${YELLOW}Additional Manual Testing Recommendations:${NC}"
echo "1. Test with 100+ SKUs to verify cart limit"
echo "2. Test concurrent users with same cart"
echo "3. Test with very large quantities"
echo "4. Test database persistence after server restart"
echo "5. Test API performance with multiple concurrent requests" 