#!/bin/bash

SECRET="d2bd5da65bffed6462aef4f8adbd44a1b7ba5223560a92e85549c91fd9d20854"
MESSAGE_ID="test-message-id-$(date +%s)"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
BODY='{"challenge":"test-challenge-12345","subscription":{"type":"channel.subscribe","version":"1"}}'

# Calculate HMAC signature
MESSAGE="${MESSAGE_ID}${TIMESTAMP}${BODY}"
SIGNATURE="sha256=$(echo -n "$MESSAGE" | openssl dgst -sha256 -hmac "$SECRET" | cut -d' ' -f2)"

echo "Testing webhook endpoint..."
echo "Message ID: $MESSAGE_ID"
echo "Timestamp: $TIMESTAMP"
echo "Signature: $SIGNATURE"
echo ""

# Send request
curl -v -X POST https://www.heycasi.com/api/webhooks/twitch-events \
  -H "Content-Type: application/json" \
  -H "Twitch-Eventsub-Message-Id: $MESSAGE_ID" \
  -H "Twitch-Eventsub-Message-Timestamp: $TIMESTAMP" \
  -H "Twitch-Eventsub-Message-Signature: $SIGNATURE" \
  -H "Twitch-Eventsub-Message-Type: webhook_callback_verification" \
  -d "$BODY"
