#!/bin/bash

# Simple Twitch EventSub Setup Script
# Uses direct API calls instead of CLI

set -e

echo "🎯 Twitch EventSub Setup (Direct API)"
echo "======================================"
echo ""

# Configuration
CLIENT_ID="8lmg8rwlkhlom3idj51xka2eipxd18"
CLIENT_SECRET="iyup8v7s485sg1flaj018xcon1z9w5"
WEBHOOK_URL="https://heycasi.com/api/webhooks/twitch-events"
SECRET="d2bd5da65bffed6462aef4f8adbd44a1b7ba5223560a92e85549c91fd9d20854"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get access token
echo "🔑 Getting access token..."
TOKEN_RESPONSE=$(curl -s -X POST 'https://id.twitch.tv/oauth2/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&grant_type=client_credentials")

ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "${RED}❌ Failed to get access token${NC}"
    echo "$TOKEN_RESPONSE"
    exit 1
fi

echo "${GREEN}✓${NC} Got access token"
echo ""

# Get user info
echo "${YELLOW}📝 Enter your Twitch username:${NC}"
read -p "Username: " TWITCH_USERNAME

echo ""
echo "🔍 Looking up user ID..."

USER_RESPONSE=$(curl -s -X GET "https://api.twitch.tv/helix/users?login=$TWITCH_USERNAME" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Client-Id: $CLIENT_ID")

BROADCASTER_ID=$(echo "$USER_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$BROADCASTER_ID" ]; then
    echo "${RED}❌ Could not find user: $TWITCH_USERNAME${NC}"
    exit 1
fi

echo "${GREEN}✅ Found user ID: $BROADCASTER_ID${NC}"
echo ""
echo "📡 Subscribing to events..."
echo ""

# Function to subscribe to an event
subscribe_to_event() {
    local EVENT_TYPE=$1
    local VERSION=$2
    local CONDITION=$3

    echo "  → $EVENT_TYPE..."

    RESPONSE=$(curl -s -X POST 'https://api.twitch.tv/helix/eventsub/subscriptions' \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Client-Id: $CLIENT_ID" \
      -H 'Content-Type: application/json' \
      -d "{
        \"type\": \"$EVENT_TYPE\",
        \"version\": \"$VERSION\",
        \"condition\": $CONDITION,
        \"transport\": {
          \"method\": \"webhook\",
          \"callback\": \"$WEBHOOK_URL\",
          \"secret\": \"$SECRET\"
        }
      }")

    if echo "$RESPONSE" | grep -q '"status":"webhook_callback_verification_pending"'; then
        echo "    ${GREEN}✓ Success${NC}"
        return 0
    elif echo "$RESPONSE" | grep -q '"status":"enabled"'; then
        echo "    ${GREEN}✓ Already subscribed${NC}"
        return 0
    elif echo "$RESPONSE" | grep -q 'subscription already exists'; then
        echo "    ${GREEN}✓ Already subscribed${NC}"
        return 0
    else
        echo "    ${RED}✗ Failed${NC}"
        echo "$RESPONSE" | head -3
        return 1
    fi
}

SUCCESS=0
TOTAL=5

# Subscribe to all events
subscribe_to_event "channel.subscribe" "1" "{\"broadcaster_user_id\":\"$BROADCASTER_ID\"}" && ((SUCCESS++))
subscribe_to_event "channel.subscription.message" "1" "{\"broadcaster_user_id\":\"$BROADCASTER_ID\"}" && ((SUCCESS++))
subscribe_to_event "channel.follow" "2" "{\"broadcaster_user_id\":\"$BROADCASTER_ID\",\"moderator_user_id\":\"$BROADCASTER_ID\"}" && ((SUCCESS++))
subscribe_to_event "channel.cheer" "1" "{\"broadcaster_user_id\":\"$BROADCASTER_ID\"}" && ((SUCCESS++))
subscribe_to_event "channel.raid" "1" "{\"to_broadcaster_user_id\":\"$BROADCASTER_ID\"}" && ((SUCCESS++))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${GREEN}✅ Setup Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Subscribed to $SUCCESS/$TOTAL events"
echo ""
echo "🎉 Go live and trigger some events to see them in your Activity Feed!"
echo ""
echo "📊 To view subscriptions:"
echo "   curl -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'Client-Id: $CLIENT_ID' https://api.twitch.tv/helix/eventsub/subscriptions"
echo ""
