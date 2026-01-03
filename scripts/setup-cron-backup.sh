#!/bin/bash

# Setup Cron Job for Automated Daily Backups

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="${SCRIPT_DIR}/backup-mongodb.sh"

# Make backup script executable
chmod +x ${BACKUP_SCRIPT}

# Create cron job (runs daily at 1 AM)
CRON_JOB="0 1 * * * ${BACKUP_SCRIPT} >> /var/log/mongodb-backup.log 2>&1"

# Check if cron job already exists
crontab -l 2>/dev/null | grep -q "${BACKUP_SCRIPT}"

if [ $? -eq 0 ]; then
    echo "Cron job already exists"
else
    # Add cron job
    (crontab -l 2>/dev/null; echo "${CRON_JOB}") | crontab -
    echo "Cron job added successfully"
    echo "Backups will run daily at 1:00 AM"
fi

# Display current crontab
echo ""
echo "Current cron jobs:"
crontab -l

# Create log directory
sudo mkdir -p /var/log
sudo touch /var/log/mongodb-backup.log
sudo chmod 666 /var/log/mongodb-backup.log

echo ""
echo "Setup complete!"
echo "Backup logs will be written to: /var/log/mongodb-backup.log"
