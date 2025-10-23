#!/bin/bash

CLIENT_ID="8lmg8rwlkhlom3idj51xka2eipxd18"
CLIENT_SECRET="iyup8v7s485sg1flaj018xcon1z9w5"

echo "🔍 Checking Twitch EventSub subscriptions..."
echo ""

# Get access token
TOKEN_RESPONSE=$(curl -s -X POST 'https://id.twitch.tv/oauth2/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&grant_type=client_credentials")

ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Failed to get access token"
    exit 1
fi

# Get subscriptions
SUBS=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Client-Id: $CLIENT_ID" \
  "https://api.twitch.tv/helix/eventsub/subscriptions")

echo "$SUBS" | grep -o '"type":"[^"]*"' | cut -d'"' -f4 | while read TYPE; do
    STATUS=$(echo "$SUBS" | grep -A 5 "\"type\":\"$TYPE\"" | grep -o '"status":"[^"]*"' | cut -d'"' -f4 | head -1)

    if [ "$STATUS" = "enabled" ]; then
        echo "✅ $TYPE - $STATUS"
    elif [ "$STATUS" = "webhook_callback_verification_pending" ]; then
        echo "⏳ $TYPE - Verification pending"
    else
        echo "❌ $TYPE - $STATUS"
    fi
done

echo ""
echo "Total subscriptions:"
echo "$SUBS" | grep -c '"type"'
