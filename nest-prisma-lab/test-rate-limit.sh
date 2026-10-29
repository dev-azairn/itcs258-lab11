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

# 1. Test The Rate Limit
for i in {1..15}; do curl -I -H "Authorization: Bearer $TOKEN" http://localhost:3000/rooms; done > output.txt


