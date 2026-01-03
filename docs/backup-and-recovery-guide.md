# Backup and Recovery Guide

## Overview

This guide covers backup strategies, data retention policies, and recovery procedures for the Face Recognition and Crowd Analysis System.

## Backup Strategy

### Automated Daily Backups

**Schedule:** Daily at 1:00 AM  
**Retention:** 30 days  
**Location:** `/backup/mongodb/`

### What Gets Backed Up

1. **MongoDB Database**
   - User accounts
   - Face profiles and embeddings
   - Attendance records
   - Crowd count records
   - Audit logs

2. **GridFS Files**
   - Facial images
   - Group photos
   - Crowd images
   - Density maps

## Setup Automated Backups

### 1. Configure Backup Script

```bash
# Set environment variables
export MONGO_HOST=localhost
export MONGO_PORT=27017
export MONGO_USER=backup_user
export MONGO_PASSWORD=secure_password

# Make scripts executable
chmod +x scripts/backup-mongodb.sh
chmod +x scripts/restore-mongodb.sh
chmod +x scripts/setup-cron-backup.sh
```

### 2. Setup Cron Job

```bash
# Run setup script
./scripts/setup-cron-backup.sh

# Verify cron job
crontab -l
```

### 3. Test Backup

```bash
# Run manual backup
./scripts/backup-mongodb.sh

# Check backup files
ls -lh /backup/mongodb/
```

## Manual Backup

### Create Backup

```bash
# Using backup script
./scripts/backup-mongodb.sh

# Or using mongodump directly
mongodump --host localhost --port 27017 \
  --db face-recognition \
  --out /backup/mongodb/manual_backup_$(date +%Y%m%d)
```

### Backup Specific Collections

```bash
# Backup only face profiles
mongodump --host localhost --port 27017 \
  --db face-recognition \
  --collection faceprofiles \
  --out /backup/mongodb/faceprofiles_backup
```

## Restore Procedures

### Full Database Restore

```bash
# List available backups
ls -lh /backup/mongodb/

# Restore from backup
./scripts/restore-mongodb.sh backup_face-recognition_20240103_010000.tar.gz
```

### Restore Specific Collection

```bash
# Extract backup
cd /backup/mongodb
tar -xzf backup_face-recognition_20240103_010000.tar.gz

# Restore specific collection
mongorestore --host localhost --port 27017 \
  --db face-recognition \
  --collection faceprofiles \
  backup_face-recognition_20240103_010000/face-recognition/faceprofiles.bson
```

### Point-in-Time Recovery

```bash
# Restore to specific timestamp
mongorestore --host localhost --port 27017 \
  --db face-recognition \
  --oplogReplay \
  --oplogLimit 1704240000:1 \
  /backup/mongodb/backup_face-recognition_20240103_010000
```

## Data Retention Policies

### Attendance Records

**Retention Period:** 12 months  
**Cleanup Schedule:** Daily at 2:00 AM

Records older than 12 months are automatically deleted.

### Crowd Count Records

**Retention Period:** 12 months  
**Cleanup Schedule:** Daily at 2:00 AM

### Audit Logs

**Retention Period:** 24 months  
**Cleanup Schedule:** Daily at 2:00 AM

### Face Profiles

**Retention:** Indefinite (until user deletion)  
**Deletion:** On user request (GDPR compliance)

## Data Archival

### Archive Old Records

```bash
# Run archival process
node -e "require('./backend/src/services/dataRetentionService').archiveOldRecords()"
```

Records older than 6 months but within retention period are marked as archived.

### Export Archived Data

```bash
# Export to JSON
mongoexport --host localhost --port 27017 \
  --db face-recognition \
  --collection attendances \
  --query '{"archived": true}' \
  --out archived_attendance_records.json
```

## Backup Verification

### Verify Backup Integrity

```bash
# List contents of backup
tar -tzf /backup/mongodb/backup_face-recognition_20240103_010000.tar.gz

# Verify MongoDB backup
mongorestore --host localhost --port 27017 \
  --db face-recognition-test \
  --dryRun \
  /backup/mongodb/backup_face-recognition_20240103_010000
```

### Test Restore

```bash
# Restore to test database
mongorestore --host localhost --port 27017 \
  --db face-recognition-test \
  /backup/mongodb/backup_face-recognition_20240103_010000

# Verify data
mongo face-recognition-test --eval "db.faceprofiles.count()"
```

## Disaster Recovery

### Complete System Failure

1. **Restore Infrastructure**
   ```bash
   # Deploy fresh system
   docker-compose up -d
   ```

2. **Restore Database**
   ```bash
   # Restore from latest backup
   ./scripts/restore-mongodb.sh backup_face-recognition_latest.tar.gz
   ```

3. **Verify Services**
   ```bash
   # Check health
   curl http://localhost:5000/health
   curl http://localhost:5000/api/monitoring/health
   ```

4. **Validate Data**
   ```bash
   # Check record counts
   mongo face-recognition --eval "
     db.users.count();
     db.faceprofiles.count();
     db.attendances.count();
   "
   ```

### Partial Data Loss

1. **Identify Lost Data**
   ```bash
   # Check audit logs
   mongo face-recognition --eval "
     db.auditlogs.find({
       timestamp: { \$gte: ISODate('2024-01-03T00:00:00Z') }
     }).count()
   "
   ```

2. **Restore Specific Collections**
   ```bash
   # Restore only affected collections
   mongorestore --host localhost --port 27017 \
     --db face-recognition \
     --collection attendances \
     --drop \
     /backup/mongodb/backup/face-recognition/attendances.bson
   ```

## Backup Monitoring

### Check Backup Status

```bash
# View backup logs
tail -f /var/log/mongodb-backup.log

# Check backup sizes
du -sh /backup/mongodb/*

# Count backups
ls /backup/mongodb/backup_*.tar.gz | wc -l
```

### Backup Alerts

Set up monitoring alerts for:
- Backup failures
- Backup size anomalies
- Missing backups
- Disk space issues

### Monitoring Script

```bash
#!/bin/bash
# check-backup-status.sh

BACKUP_DIR="/backup/mongodb"
EXPECTED_BACKUP_AGE_HOURS=25

# Find latest backup
LATEST_BACKUP=$(ls -t ${BACKUP_DIR}/backup_*.tar.gz | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "ERROR: No backups found!"
    exit 1
fi

# Check backup age
BACKUP_AGE=$(( ($(date +%s) - $(stat -c %Y "$LATEST_BACKUP")) / 3600 ))

if [ $BACKUP_AGE -gt $EXPECTED_BACKUP_AGE_HOURS ]; then
    echo "WARNING: Latest backup is ${BACKUP_AGE} hours old"
    exit 1
fi

echo "OK: Latest backup is ${BACKUP_AGE} hours old"
exit 0
```

## Off-Site Backups

### Cloud Storage

**AWS S3:**
```bash
# Upload to S3
aws s3 cp /backup/mongodb/backup_face-recognition_20240103_010000.tar.gz \
  s3://my-backup-bucket/mongodb/

# Sync entire backup directory
aws s3 sync /backup/mongodb/ s3://my-backup-bucket/mongodb/
```

**Google Cloud Storage:**
```bash
# Upload to GCS
gsutil cp /backup/mongodb/backup_face-recognition_20240103_010000.tar.gz \
  gs://my-backup-bucket/mongodb/
```

### Automated Off-Site Backup

```bash
#!/bin/bash
# backup-to-cloud.sh

BACKUP_DIR="/backup/mongodb"
LATEST_BACKUP=$(ls -t ${BACKUP_DIR}/backup_*.tar.gz | head -1)

# Upload to S3
aws s3 cp "$LATEST_BACKUP" s3://my-backup-bucket/mongodb/

# Verify upload
aws s3 ls s3://my-backup-bucket/mongodb/$(basename "$LATEST_BACKUP")

if [ $? -eq 0 ]; then
    echo "Backup uploaded successfully"
else
    echo "Backup upload failed!"
    exit 1
fi
```

## Best Practices

1. **Regular Testing**
   - Test restore procedures monthly
   - Verify backup integrity
   - Document recovery time

2. **Multiple Backup Locations**
   - Local backups for quick recovery
   - Off-site backups for disaster recovery
   - Cloud backups for redundancy

3. **Monitoring**
   - Monitor backup success/failure
   - Track backup sizes
   - Alert on anomalies

4. **Documentation**
   - Keep recovery procedures updated
   - Document backup locations
   - Maintain contact information

5. **Security**
   - Encrypt backups
   - Secure backup storage
   - Limit access to backups

6. **Retention**
   - Follow data retention policies
   - Clean up old backups
   - Archive important data

## Troubleshooting

### Backup Fails

**Check disk space:**
```bash
df -h /backup
```

**Check MongoDB connection:**
```bash
mongo --host localhost --port 27017 --eval "db.adminCommand('ping')"
```

**Check permissions:**
```bash
ls -la /backup/mongodb
```

### Restore Fails

**Check backup file:**
```bash
tar -tzf backup_file.tar.gz
```

**Check MongoDB version compatibility:**
```bash
mongorestore --version
mongo --version
```

**Check database permissions:**
```bash
mongo admin --eval "db.getUsers()"
```

## Recovery Time Objectives

- **RTO (Recovery Time Objective):** 4 hours
- **RPO (Recovery Point Objective):** 24 hours

### Expected Recovery Times

- Full database restore: 1-2 hours
- Specific collection restore: 15-30 minutes
- Point-in-time recovery: 2-4 hours
