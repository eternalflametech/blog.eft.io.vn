#!/usr/bin/env bash
# ==============================================================================
# Script: get_webdate.sh
# Logic: Dynamically fetches current real-world date and time via HTTP Date header.
# Input: Optional custom probe URL ($1)
# Output: Formatted UTC and Vietnam Time (UTC+7) timestamps without using system clock.
# ==============================================================================

set -euo pipefail

PROBE_TARGETS=(
  "${1:-}"
  "https://cloudflare.com"
  "https://google.com"
  "https://github.com"
  "https://wikipedia.org"
)

RAW_DATE=""

for TARGET in "${PROBE_TARGETS[@]}"; do
  if [ -z "$TARGET" ]; then
    continue
  fi
  # Fetch HTTP header with 3-second timeout
  HTTP_DATE=$(curl -sI --max-time 3 "$TARGET" 2>/dev/null | grep -i '^date:' | head -n 1 | sed -e 's/^[Dd][Aa][Tt][Ee]:[[:space:]]*//' | tr -d '\r')
  if [ -n "$HTTP_DATE" ]; then
    RAW_DATE="$HTTP_DATE"
    SOURCE_URL="$TARGET"
    break
  fi
done

if [ -z "$RAW_DATE" ]; then
  echo "Error: Unable to fetch webdate from any HTTP header endpoint." >&2
  exit 1
fi

# Convert HTTP Date format (RFC 1123) to ISO 8601 UTC and VN Time (UTC+7)
UTC_ISO=$(date -u -d "$RAW_DATE" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -j -f "%a, %d %b %Y %H:%M:%S GMT" "$RAW_DATE" +"%Y-%m-%dT%H:%M:%SZ")
DATE_SLUG=$(date -u -d "$RAW_DATE" +"%Y%m%d-%H%M%S" 2>/dev/null || date -u -j -f "%a, %d %b %Y %H:%M:%S GMT" "$RAW_DATE" +"%Y%m%d-%H%M%S")
VN_TIME=$(date -d "$RAW_DATE +7 hours" +"%Y-%m-%d %H:%M:%S (UTC+7)" 2>/dev/null || echo "N/A")

echo "SOURCE=\"$SOURCE_URL\""
echo "RAW_HTTP_DATE=\"$RAW_DATE\""
echo "UTC_ISO=\"$UTC_ISO\""
echo "VN_TIME=\"$VN_TIME\""
echo "DATE_SLUG=\"$DATE_SLUG\""
