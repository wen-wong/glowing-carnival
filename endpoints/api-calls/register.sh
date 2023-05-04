#!/bin/bash

read -p "Enter username: " username
read -p "Enter email address: " email
read -p "Enter password: " password

echo ""

# Make a POST request to /auth/register endpoint
curl --location --request POST 'http://localhost:1337/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username": "'"$username"'",
    "email":"'"$email"'",
    "password": "'"$password"'"
}'