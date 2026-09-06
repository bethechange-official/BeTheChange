#!/bin/bash

BASE_URL="https://api.bethechangeorga.com/api"
PASS=0
FAIL=0
TOKEN=""
COOKIE_FILE="/tmp/btc_test_cookies.txt"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check() {
  local name="$1"
  local status="$2"
  local expected="$3"
  local body="$4"

  if echo "$body" | grep -q "\"success\":true" && [ "$status" -eq "$expected" ]; then
    echo -e "${GREEN}✅ PASS${NC} — $name"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}❌ FAIL${NC} — $name (HTTP $status)"
    echo "   Response: $(echo $body | head -c 200)"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo -e "${YELLOW}==============================${NC}"
echo -e "${YELLOW}  BTC API Test Suite${NC}"
echo -e "${YELLOW}==============================${NC}"
echo ""

# 1. Health
echo "--- System ---"
RESP=$(curl -s -o /tmp/btc_body.txt -w "%{http_code}" "$BASE_URL/health")
check "Health check" "$RESP" 200 "$(cat /tmp/btc_body.txt)"

# 2. Ready
RESP=$(curl -s -o /tmp/btc_body.txt -w "%{http_code}" "$BASE_URL/ready")
check "DB ready check" "$RESP" 200 "$(cat /tmp/btc_body.txt)"

# 3. Admin Login
echo ""
echo "--- Admin Auth ---"
RESP=$(curl -s -o /tmp/btc_body.txt -w "%{http_code}" -X POST "$BASE_URL/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bethechangeorga.com","password":"BTC@Orga#2025!Secure"}' \
  -c "$COOKIE_FILE")
BODY=$(cat /tmp/btc_body.txt)
check "Admin login" "$RESP" 200 "$BODY"
TOKEN=$(echo "$BODY" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# 4. Admin Me
RESP=$(curl -s -o /tmp/btc_body.txt -w "%{http_code}" "$BASE_URL/admin/auth/me" \
  -H "Authorization: Bearer $TOKEN")
check "Admin get profile" "$RESP" 200 "$(cat /tmp/btc_body.txt)"

# 5. Wrong password
RESP=$(curl -s -o /tmp/btc_body.txt -w "%{http_code}" -X POST "$BASE_URL/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bethechangeorga.com","password":"wrongpassword"}')
BODY=$(cat /tmp/btc_body.txt)
if [ "$RESP" -eq 401 ]; then
  echo -e "${GREEN}✅ PASS${NC} — Admin login with wrong password blocked (401)"
  PASS=$((PASS + 1))
else
  echo -e "${RED}❌ FAIL${NC} — Admin login with wrong password not blocked"
  FAIL=$((FAIL + 1))
fi

# 6. Dashboard
echo ""
echo "--- Admin Dashboard ---"
RESP=$(curl -s -o /tmp/btc_body.txt -w "%{http_code}" "$BASE_URL/admin/dashboard" \
  -H "Authorization: Bearer $TOKEN")
check "Admin dashboard" "$RESP" 200 "$(cat /tmp/btc_body.txt)"

# 7. Admin Categories
echo ""
echo "--- Admin Categories ---"
RESP=$(curl -s -o /tmp/btc_body.txt -w "%{http_code}" "$BASE_URL/admin/categories" \
  -H "Authorization: Bearer $TOKEN")
check "Get categories (admin)" "$RESP" 200 "$(cat /tmp/btc_body.txt)"

# 8. Admin Products
echo ""
echo "--- Admin Products ---"
RESP=$(curl -s -o /tmp/btc_body.txt -w "%{http_code}" "$BASE_URL/admin/products" \
  -H "Authorization: Bearer $TOKEN")
check "Get products (admin)" "$RESP" 200 "$(cat /tmp/btc_body.txt)"

# 9. Admin Orders
echo ""
echo "--- Admin Orders ---"
RESP=$(curl -s -o /tmp/btc_body.txt -w "%{http_code}" "$BASE_URL/admin/orders" \
  -H "Authorization: Bearer $TOKEN")
check "Get orders (admin)" "$RESP" 200 "$(cat /tmp/btc_body.txt)"

# 10. Admin Customers
RESP=$(curl -s -o /tmp/btc_body.txt -w "%{http_code}" "$BASE_URL/admin/customers" \
  -H "Authorization: Bearer $TOKEN")
check "Get customers (admin)" "$RESP" 200 "$(cat /tmp/btc_body.txt)"

# 11. Admin Settings
RESP=$(curl -s -o /tmp/btc_body.txt -w "%{http_code}" "$BASE_URL/admin/settings" \
  -H "Authorization: Bearer $TOKEN")
check "Get settings (admin)" "$RESP" 200 "$(cat /tmp/btc_body.txt)"

# 12. Public Products
echo ""
echo "--- Public Storefront ---"
RESP=$(curl -s -o /tmp/btc_body.txt -w "%{http_code}" "$BASE_URL/products")
check "Get products (public)" "$RESP" 200 "$(cat /tmp/btc_body.txt)"

# 13. Public Categories
RESP=$(curl -s -o /tmp/btc_body.txt -w "%{http_code}" "$BASE_URL/categories")
check "Get categories (public)" "$RESP" 200 "$(cat /tmp/btc_body.txt)"

# 14. Public Settings
RESP=$(curl -s -o /tmp/btc_body.txt -w "%{http_code}" "$BASE_URL/settings")
check "Get settings (public)" "$RESP" 200 "$(cat /tmp/btc_body.txt)"

# 15. Security - Access admin without token
echo ""
echo "--- Security ---"
RESP=$(curl -s -o /tmp/btc_body.txt -w "%{http_code}" "$BASE_URL/admin/dashboard")
if [ "$RESP" -eq 401 ]; then
  echo -e "${GREEN}✅ PASS${NC} — Admin dashboard blocked without token (401)"
  PASS=$((PASS + 1))
else
  echo -e "${RED}❌ FAIL${NC} — Admin dashboard accessible without token!"
  FAIL=$((FAIL + 1))
fi

# 16. Security - Access admin with invalid token
RESP=$(curl -s -o /tmp/btc_body.txt -w "%{http_code}" "$BASE_URL/admin/dashboard" \
  -H "Authorization: Bearer invalidtoken123")
if [ "$RESP" -eq 401 ]; then
  echo -e "${GREEN}✅ PASS${NC} — Admin dashboard blocked with invalid token (401)"
  PASS=$((PASS + 1))
else
  echo -e "${RED}❌ FAIL${NC} — Admin dashboard accessible with invalid token!"
  FAIL=$((FAIL + 1))
fi

# 17. Customer Register
echo ""
echo "--- Customer Auth ---"
RESP=$(curl -s -o /tmp/btc_body.txt -w "%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"testuser@btctest.com","password":"TestPass@123","phone":"9876543210"}' \
  -c "$COOKIE_FILE")
check "Customer register" "$RESP" 201 "$(cat /tmp/btc_body.txt)"

# 18. Customer Login
RESP=$(curl -s -o /tmp/btc_body.txt -w "%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@btctest.com","password":"TestPass@123"}' \
  -c "$COOKIE_FILE")
BODY=$(cat /tmp/btc_body.txt)
check "Customer login" "$RESP" 200 "$BODY"
CUSTOMER_TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 19. Admin Logout
echo ""
echo "--- Cleanup ---"
RESP=$(curl -s -o /tmp/btc_body.txt -w "%{http_code}" -X POST "$BASE_URL/admin/auth/logout" \
  -H "Authorization: Bearer $TOKEN" \
  -b "$COOKIE_FILE")
check "Admin logout" "$RESP" 200 "$(cat /tmp/btc_body.txt)"

# Cleanup
rm -f "$COOKIE_FILE" /tmp/btc_body.txt

echo ""
echo -e "${YELLOW}==============================${NC}"
echo -e "  Total: $((PASS + FAIL)) | ${GREEN}Pass: $PASS${NC} | ${RED}Fail: $FAIL${NC}"
echo -e "${YELLOW}==============================${NC}"
echo ""
