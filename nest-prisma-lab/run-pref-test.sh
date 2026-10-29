#!/bin/bash

BASE_URL="http://localhost:3000"
ADMIN_EMAIL="piyapong.pon@student.com" # You need to use your admin's email
PASSWORD="hello123-Suay" # You need to use your admin's password

echo "--- Performance Test with Autocannon ---"


# 1. Login to get token
echo "1. Getting Auth Token..."
echo "1. Getting Auth Token..."
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$PASSWORD\"}" | sed 's/.*"access_token":"\([^"]*\)".*/\1/')

if [ -z "$TOKEN" ] || [ ${#TOKEN} -lt 10 ]; then
    echo "❌ Login Failed. Token empty."
    exit 1
fi
echo "✅ Token acquired."



if [ -z "$TOKEN" ] || [ ${#TOKEN} -lt 10 ]; then
    echo "❌ Login Failed. Token empty."
    exit 1
fi
echo "✅ Token acquired."

# 2. Run Autocannon
echo ""
echo "2. Running Autocannon (20s duration)..."
echo "Target: $BASE_URL/auth/login"
echo ""

# -c 100: 100 concurrent connections
# -d 10: 10 seconds duration
autocannon -c 100 -d 20 -H "Authorization: Bearer $TOKEN" "$BASE_URL/rooms" > benchmark.txt