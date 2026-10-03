#!/usr/bin/env bash
# ==============================================================================
# Script: generate_report.sh
# Logic: Generates a task execution report in ~/reports/{taskid}-{datetime}.md
# Input: $1 (Task ID), $2 (Title/Summary), $3 (Status: SUCCESS|FAILED|IN_PROGRESS)
# Output: Path to generated report file.
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TASK_ID="${1:-task-unknown}"
REPORT_TITLE="${2:-Task Execution Report}"
STATUS="${3:-SUCCESS}"

# Fetch dynamic webdate via get_webdate.sh
WEBDATE_OUTPUT="$("${SCRIPT_DIR}/get_webdate.sh")"
UTC_ISO=$(echo "$WEBDATE_OUTPUT" | grep '^UTC_ISO=' | cut -d'=' -f2- | tr -d '"')
DATE_SLUG=$(echo "$WEBDATE_OUTPUT" | grep '^DATE_SLUG=' | cut -d'=' -f2- | tr -d '"')
VN_TIME=$(echo "$WEBDATE_OUTPUT" | grep '^VN_TIME=' | cut -d'=' -f2- | tr -d '"')
DATE_SOURCE=$(echo "$WEBDATE_OUTPUT" | grep '^SOURCE=' | cut -d'=' -f2- | tr -d '"')

REPORTS_DIR="${HOME}/reports"
mkdir -p "$REPORTS_DIR"

REPORT_FILE="${REPORTS_DIR}/${TASK_ID}-${DATE_SLUG}.md"

cat <<EOF > "$REPORT_FILE"
# Task Report: ${REPORT_TITLE}

## Metadata
- **Task ID:** ${TASK_ID}
- **Status:** ${STATUS}
- **Timestamp (UTC):** ${UTC_ISO}
- **Timestamp (Vietnam UTC+7):** ${VN_TIME}
- **Date Source (Dynamic HTTP):** ${DATE_SOURCE}
- **Host Environment:** Debian 13 (Trixie) / Linux
- **Project:** Eternal Flame Tech Blog (EFT Blog)
- **Organization:** Eternal Flame Tech (THPT Chuyên Nguyễn Thị Minh Khai, Cần Thơ)

## Execution Context & Summary
EOF

echo "Report generated at: $REPORT_FILE"
