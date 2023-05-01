#!/bin/bash

read -p "Enter email address: " email
read -p "Enter password: " password

echo ""

# Make a POST request to /auth/register endpoint
curl --location --request POST 'http://localhost:1337/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "'"$email"'",
    "password": "'"$password"'"
}'