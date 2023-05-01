#!/bin/bash

read -p "Enter refresh token: " token

echo ""

# Make a POST request to /auth/register endpoint
curl --location --request POST 'http://localhost:1337/auth/refresh-token' \
--header 'Content-Type: application/json' \
--data-raw '{
    "refreshToken": "'"$token"'"
}'