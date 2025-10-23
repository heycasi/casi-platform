#!/bin/bash

CLIENT_ID="8lmg8rwlkhlom3idj51xka2eipxd18"
CLIENT_SECRET="iyup8v7s485sg1flaj018xcon1z9w5"
BROADCASTER_ID="104659233"  # fifakillvizualz
WEBHOOK_URL="https://www.heycasi.com/api/webhooks/twitch-events"
SECRET="d2bd5da65bffed6462aef4f8adbd44a1b7ba5223560a92e85549c91fd9d20854"

echo "📡 Creating EventSub subscription for fifakillvizualz..."
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

# Create channel.subscribe subscription
echo "Creating channel.subscribe subscription..."
RESPONSE=$(curl -s -X POST 'https://api.twitch.tv/helix/eventsub/subscriptions' \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Client-Id: $CLIENT_ID" \
  -H 'Content-Type: application/json' \
  -d "{
    \"type\": \"channel.subscribe\",
    \"version\": \"1\",
    \"condition\": {
      \"broadcaster_user_id\": \"$BROADCASTER_ID\"
    },
    \"transport\": {
      \"method\": \"webhook\",
      \"callback\": \"$WEBHOOK_URL\",
      \"secret\": \"$SECRET\"
    }
  }")

echo "$RESPONSE" | python3 -m json.tool
SUB_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$SUB_ID" ]; then
    echo "✅ Created subscription: $SUB_ID"
    echo ""
    echo "Waiting 5 seconds for verification..."
    sleep 5

    # Check subscription status
    STATUS_RESPONSE=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Client-Id: $CLIENT_ID" \
      "https://api.twitch.tv/helix/eventsub/subscriptions?id=$SUB_ID")

    echo "$STATUS_RESPONSE" | python3 -m json.tool
else
    echo "❌ Failed to create subscription"
fi
