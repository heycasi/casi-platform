#!/bin/bash

# Twitch EventSub Setup Script
# This script will help you subscribe to Twitch events for the Activity Feed

set -e

echo "🎯 Twitch EventSub Setup"
echo "========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
WEBHOOK_URL="https://www.heycasi.com/api/webhooks/twitch-events"
SECRET="d2bd5da65bffed6462aef4f8adbd44a1b7ba5223560a92e85549c91fd9d20854"

# Check if twitch CLI is installed
if ! command -v twitch &> /dev/null; then
    echo "❌ Twitch CLI is not installed"
    echo "Run: brew install twitch-cli"
    exit 1
fi

# Check if user is logged in
if ! twitch token 2>/dev/null | grep -q "User Access Token"; then
    echo "⚠️  You need to login to Twitch first"
    echo ""
    echo "Running: twitch configure"
    echo ""
    twitch configure
fi

# Get broadcaster ID
echo ""
echo "${YELLOW}📝 Enter your Twitch username:${NC}"
read -p "Username: " TWITCH_USERNAME

echo ""
echo "🔍 Looking up your Twitch user ID..."

# Get user ID using the API
USER_DATA=$(twitch api get users -q login="$TWITCH_USERNAME" 2>/dev/null)

if [ -z "$USER_DATA" ]; then
    echo "❌ Could not find user: $TWITCH_USERNAME"
    exit 1
fi

BROADCASTER_ID=$(echo "$USER_DATA" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$BROADCASTER_ID" ]; then
    echo "❌ Could not extract user ID from response"
    exit 1
fi

echo "${GREEN}✅ Found user ID: $BROADCASTER_ID${NC}"
echo ""

# Subscribe to events
echo "📡 Subscribing to Twitch events..."
echo ""

# Array of event subscriptions
declare -a events=(
    "channel.subscribe:1:{\"broadcaster_user_id\":\"$BROADCASTER_ID\"}"
    "channel.subscription.message:1:{\"broadcaster_user_id\":\"$BROADCASTER_ID\"}"
    "channel.follow:2:{\"broadcaster_user_id\":\"$BROADCASTER_ID\",\"moderator_user_id\":\"$BROADCASTER_ID\"}"
    "channel.cheer:1:{\"broadcaster_user_id\":\"$BROADCASTER_ID\"}"
    "channel.raid:1:{\"to_broadcaster_user_id\":\"$BROADCASTER_ID\"}"
)

SUCCESS_COUNT=0
TOTAL_COUNT=${#events[@]}

for EVENT_DATA in "${events[@]}"; do
    IFS=':' read -r EVENT_TYPE VERSION CONDITION <<< "$EVENT_DATA"

    echo "  → Subscribing to $EVENT_TYPE..."

    RESPONSE=$(twitch api post eventsub/subscriptions -b "{
        \"type\": \"$EVENT_TYPE\",
        \"version\": \"$VERSION\",
        \"condition\": $CONDITION,
        \"transport\": {
            \"method\": \"webhook\",
            \"callback\": \"$WEBHOOK_URL\",
            \"secret\": \"$SECRET\"
        }
    }" 2>&1)

    if echo "$RESPONSE" | grep -q '"status":"webhook_callback_verification_pending"'; then
        echo "    ${GREEN}✓${NC} Success"
        ((SUCCESS_COUNT++))
    elif echo "$RESPONSE" | grep -q '"status":"enabled"'; then
        echo "    ${GREEN}✓${NC} Already subscribed"
        ((SUCCESS_COUNT++))
    else
        echo "    ${YELLOW}⚠${NC} May have failed (check below)"
        echo "$RESPONSE" | head -5
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${GREEN}✅ Setup Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Subscribed to $SUCCESS_COUNT/$TOTAL_COUNT events"
echo ""
echo "📊 View your subscriptions:"
echo "   twitch api get eventsub/subscriptions"
echo ""
echo "🧪 Test your webhook:"
echo "   curl https://heycasi.com/api/webhooks/twitch-events"
echo ""
echo "🎉 Go live and trigger some events to see them in your Activity Feed!"
echo ""
