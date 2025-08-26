#!/bin/bash

# AIMY Platform - Proof of Reserve Scheduler
# This script sets up automated daily PoR report generation

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CRON_JOB="0 9 * * * cd $PROJECT_ROOT && node scripts/generate-por.js >> logs/por-generation.log 2>&1"

echo "🚀 Setting up automated Proof of Reserve report generation..."
echo "📅 Reports will be generated daily at 9:00 AM"
echo ""

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_ROOT/logs"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "generate-por.js"; then
    echo "⚠️  Cron job already exists. Removing old entry..."
    crontab -l 2>/dev/null | grep -v "generate-por.js" | crontab -
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "✅ Cron job added successfully!"
echo "📋 Current cron jobs:"
crontab -l

echo ""
echo "🔍 To verify the setup:"
echo "   - Check cron logs: tail -f /var/log/cron"
echo "   - View PoR logs: tail -f $PROJECT_ROOT/logs/por-generation.log"
echo "   - Manual test: node scripts/generate-por.js"
echo ""
echo "🗑️  To remove the cron job:"
echo "   crontab -e"
echo "   (then delete the line with generate-por.js)"
echo ""
echo "📊 Reports will be saved to: $PROJECT_ROOT/reports/"
echo "⏰ Next report generation: Tomorrow at 9:00 AM"
