#!/bin/bash

# Run multi-platform migration in Supabase
# This script executes the SQL migration using Supabase's REST API

set -e

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | grep -v '^$' | xargs)
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_ROLE_KEY" ]; then
  echo "❌ Missing Supabase credentials"
  echo "   SUPABASE_URL: $SUPABASE_URL"
  echo "   SERVICE_ROLE_KEY: ${SERVICE_ROLE_KEY:0:20}..."
  exit 1
fi

echo "🚀 Running multi-platform migration..."
echo "   Supabase URL: $SUPABASE_URL"

# Read the SQL migration file
SQL_CONTENT=$(cat database/multi-platform-migration.sql)

# Execute the migration using Supabase's SQL endpoint
response=$(curl -s -w "\n%{http_code}" -X POST \
  "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{\"query\": $(echo "$SQL_CONTENT" | jq -Rs .)}")

# Extract HTTP status code
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
  echo "✅ Migration executed successfully!"
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
  echo "❌ Migration failed with HTTP $http_code"
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
  exit 1
fi
