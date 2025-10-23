#!/bin/bash

# Backfill Event Subscriptions for Existing Users
# This script subscribes to Twitch events for users who signed up before auto-subscription was implemented

set -e

echo "🔄 Backfilling Event Subscriptions for Existing Users"
echo "====================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get list of Twitch user IDs from Supabase
echo "📊 Fetching user list from Supabase..."
echo ""
echo "${YELLOW}Please run this SQL query in Supabase SQL Editor and save the results:${NC}"
echo ""
echo "SELECT DISTINCT"
echo "  raw_user_meta_data->>'twitch_id' as twitch_id,"
echo "  raw_user_meta_data->>'preferred_username' as username"
echo "FROM auth.users"
echo "WHERE raw_user_meta_data->>'twitch_id' IS NOT NULL"
echo "ORDER BY username;"
echo ""
echo "${YELLOW}Then enter each Twitch user ID below (one per line, press Enter twice when done):${NC}"
echo ""

# Read user IDs
USER_IDS=()
while true; do
    read -p "Twitch User ID (or press Enter to finish): " USER_ID
    if [ -z "$USER_ID" ]; then
        break
    fi
    USER_IDS+=("$USER_ID")
done

if [ ${#USER_IDS[@]} -eq 0 ]; then
    echo "${RED}❌ No user IDs provided${NC}"
    exit 1
fi

echo ""
echo "📋 Found ${#USER_IDS[@]} users to process"
echo ""

SUCCESS_COUNT=0
FAILED_COUNT=0

for USER_ID in "${USER_IDS[@]}"; do
    echo "Processing user: $USER_ID"

    RESPONSE=$(curl -s -X POST 'https://heycasi.com/api/subscribe-user-events' \
      -H 'Content-Type: application/json' \
      -d "{\"broadcaster_user_id\":\"$USER_ID\"}")

    if echo "$RESPONSE" | grep -q '"success":true'; then
        echo "  ${GREEN}✓${NC} Subscribed successfully"
        ((SUCCESS_COUNT++))
    else
        echo "  ${RED}✗${NC} Failed"
        echo "  Response: $RESPONSE"
        ((FAILED_COUNT++))
    fi

    # Rate limit - wait 2 seconds between requests
    sleep 2
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${GREEN}✅ Backfill Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Successfully subscribed: $SUCCESS_COUNT"
echo "Failed: $FAILED_COUNT"
echo ""
