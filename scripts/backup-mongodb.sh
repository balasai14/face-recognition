#!/bin/bash

# MongoDB Backup Script
# Performs daily backups with 30-day retention

# Configuration
BACKUP_DIR="/backup/mongodb"
DB_NAME="face-recognition"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_${DB_NAME}_${TIMESTAMP}"
RETENTION_DAYS=30

# MongoDB connection
MONGO_HOST="${MONGO_HOST:-localhost}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_USER="${MONGO_USER:-}"
MONGO_PASSWORD="${MONGO_PASSWORD:-}"

# Create backup directory
mkdir -p ${BACKUP_DIR}

echo "Starting MongoDB backup: ${BACKUP_NAME}"

# Build mongodump command
DUMP_CMD="mongodump --host ${MONGO_HOST} --port ${MONGO_PORT} --db ${DB_NAME} --out ${BACKUP_DIR}/${BACKUP_NAME}"

# Add authentication if credentials provided
if [ ! -z "$MONGO_USER" ]; then
    DUMP_CMD="${DUMP_CMD} --username ${MONGO_USER} --password ${MONGO_PASSWORD} --authenticationDatabase admin"
fi

# Execute backup
eval $DUMP_CMD

if [ $? -eq 0 ]; then
    echo "Backup completed successfully"
    
    # Compress backup
    echo "Compressing backup..."
    cd ${BACKUP_DIR}
    tar -czf ${BACKUP_NAME}.tar.gz ${BACKUP_NAME}
    rm -rf ${BACKUP_NAME}
    
    echo "Backup compressed: ${BACKUP_NAME}.tar.gz"
    
    # Calculate backup size
    BACKUP_SIZE=$(du -h ${BACKUP_NAME}.tar.gz | cut -f1)
    echo "Backup size: ${BACKUP_SIZE}"
    
    # Remove old backups (older than retention period)
    echo "Cleaning up old backups (retention: ${RETENTION_DAYS} days)..."
    find ${BACKUP_DIR} -name "backup_${DB_NAME}_*.tar.gz" -mtime +${RETENTION_DAYS} -delete
    
    # List remaining backups
    echo "Current backups:"
    ls -lh ${BACKUP_DIR}/backup_${DB_NAME}_*.tar.gz
    
    echo "Backup process completed successfully"
    exit 0
else
    echo "Backup failed!"
    exit 1
fi
