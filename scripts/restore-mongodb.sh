#!/bin/bash

# MongoDB Restore Script
# Restores database from backup

# Configuration
BACKUP_DIR="/backup/mongodb"
DB_NAME="face-recognition"

# MongoDB connection
MONGO_HOST="${MONGO_HOST:-localhost}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_USER="${MONGO_USER:-}"
MONGO_PASSWORD="${MONGO_PASSWORD:-}"

# Check if backup file provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lh ${BACKUP_DIR}/backup_${DB_NAME}_*.tar.gz
    exit 1
fi

BACKUP_FILE=$1

# Check if backup file exists
if [ ! -f "${BACKUP_DIR}/${BACKUP_FILE}" ]; then
    echo "Error: Backup file not found: ${BACKUP_DIR}/${BACKUP_FILE}"
    exit 1
fi

echo "Starting MongoDB restore from: ${BACKUP_FILE}"

# Extract backup
echo "Extracting backup..."
cd ${BACKUP_DIR}
tar -xzf ${BACKUP_FILE}

# Get extracted directory name
BACKUP_NAME=$(basename ${BACKUP_FILE} .tar.gz)

# Build mongorestore command
RESTORE_CMD="mongorestore --host ${MONGO_HOST} --port ${MONGO_PORT} --db ${DB_NAME} --drop ${BACKUP_DIR}/${BACKUP_NAME}/${DB_NAME}"

# Add authentication if credentials provided
if [ ! -z "$MONGO_USER" ]; then
    RESTORE_CMD="${RESTORE_CMD} --username ${MONGO_USER} --password ${MONGO_PASSWORD} --authenticationDatabase admin"
fi

# Confirm restore
echo ""
echo "WARNING: This will drop the existing database and restore from backup!"
echo "Database: ${DB_NAME}"
echo "Backup: ${BACKUP_FILE}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled"
    rm -rf ${BACKUP_DIR}/${BACKUP_NAME}
    exit 0
fi

# Execute restore
eval $RESTORE_CMD

if [ $? -eq 0 ]; then
    echo "Restore completed successfully"
    
    # Cleanup extracted files
    rm -rf ${BACKUP_DIR}/${BACKUP_NAME}
    
    echo "Restore process completed"
    exit 0
else
    echo "Restore failed!"
    rm -rf ${BACKUP_DIR}/${BACKUP_NAME}
    exit 1
fi
