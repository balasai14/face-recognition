# Deployment Guide

## Overview

Complete guide for deploying the Face Recognition and Crowd Analysis System to production.

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.9+ (for ML services)
- MongoDB 6+
- NGINX (for reverse proxy)
- SSL certificates (for HTTPS)

## Quick Start with Docker

### 1. Clone Repository

```bash
git clone <repository-url>
cd face-recognition-crowd-analysis
```

### 2. Configure Environment

```bash
# Copy environment template
cp backend/.env.example backend/.env.production

# Edit configuration
nano backend/.env.production
```

**Required Configuration:**
```env
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/face-recognition
JWT_SECRET=<generate-strong-secret>
ENCRYPTION_KEY=<generate-32-character-key>
NODE_ENV=production
```

### 3. Start Services

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Verify Deployment

```bash
# Check services
docker-compose ps

# Check health
curl http://localhost:5000/health
curl http://localhost:5000/api/monitoring/health

# View logs
docker-compose logs -f
```

## Manual Deployment

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Run database migrations (if any)
npm run migrate

# Start with PM2
pm2 start ecosystem.config.js

# Check status
pm2 status
pm2 logs
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Serve with NGINX
# Copy dist/ to /var/www/html
```

### ML Services Setup

```bash
cd ml-services

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start individual auth service
cd individual_auth
python app.py &

# Start group auth service
cd ../group_auth
python app.py &

# Start crowd counting service
cd ../crowd_counting
python app.py &
```

## NGINX Configuration

### Setup Reverse Proxy

```bash
# Copy NGINX config
sudo cp nginx/nginx.conf /etc/nginx/sites-available/face-recognition
sudo ln -s /etc/nginx/sites-available/face-recognition /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload NGINX
sudo systemctl reload nginx
```

### SSL Certificate

```bash
# Using Let's Encrypt
sudo certbot --nginx -d api.yourdomain.com

# Or copy existing certificates
sudo cp cert.pem /etc/nginx/ssl/
sudo cp key.pem /etc/nginx/ssl/
```

## Database Setup

### Initialize MongoDB

```bash
# Start MongoDB
sudo systemctl start mongod

# Create database and user
mongo admin
> use face-recognition
> db.createUser({
    user: "app_user",
    pwd: "secure_password",
    roles: ["readWrite"]
  })
```

### Create Indexes

```bash
# Run index creation script
node backend/scripts/create-indexes.js
```

## Security Hardening

### 1. Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. Update Secrets

```bash
# Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Enable HTTPS

Ensure all traffic uses HTTPS in production:
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring Setup

### 1. Setup PM2 Monitoring

```bash
# Link PM2 to monitoring service
pm2 link <secret> <public>

# Enable startup script
pm2 startup
pm2 save
```

### 2. Setup Log Rotation

```bash
# Configure PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### 3. Setup Health Checks

```bash
# Add to crontab
crontab -e

# Check health every 5 minutes
*/5 * * * * curl -f http://localhost:5000/health || echo "Health check failed" | mail -s "Alert" admin@example.com
```

## Backup Configuration

### Setup Automated Backups

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Setup cron job
./scripts/setup-cron-backup.sh

# Test backup
./scripts/backup-mongodb.sh
```

### Configure Off-Site Backups

```bash
# Install AWS CLI
pip install awscli

# Configure credentials
aws configure

# Add to backup script
# aws s3 sync /backup/mongodb/ s3://my-backup-bucket/
```

## Performance Tuning

### 1. Enable Redis Caching

```bash
# Install Redis
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis

# Configure in .env
REDIS_URL=redis://localhost:6379
```

### 2. Optimize MongoDB

```javascript
// Enable profiling
db.setProfilingLevel(1, { slowms: 100 })

// Check slow queries
db.system.profile.find().sort({ ts: -1 }).limit(5)
```

### 3. Configure PM2 Cluster Mode

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'api',
    script: './src/server.js',
    instances: 'max',  // Use all CPU cores
    exec_mode: 'cluster'
  }]
}
```

## Scaling

### Horizontal Scaling

**Add More API Servers:**
```bash
# Deploy to multiple servers
# Update NGINX upstream configuration
upstream backend {
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}
```

**Scale ML Services:**
```bash
# Deploy ML services on separate GPU servers
# Update environment variables
ML_SERVICE_INDIVIDUAL_URL=http://ml-server-1:5001
ML_SERVICE_GROUP_URL=http://ml-server-2:5002
ML_SERVICE_CROWD_URL=http://ml-server-3:5003
```

### Vertical Scaling

**Increase Resources:**
- More CPU cores for API servers
- More RAM for caching
- GPU for ML services
- SSD for database

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs backend
pm2 logs

# Check ports
netstat -tulpn | grep :5000

# Check environment
env | grep MONGODB_URI
```

### Database Connection Issues

```bash
# Test connection
mongo --host localhost --port 27017

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Verify credentials
mongo -u app_user -p --authenticationDatabase face-recognition
```

### ML Service Errors

```bash
# Check Python dependencies
pip list

# Test ML service
curl http://localhost:5001/health

# Check GPU availability
nvidia-smi
```

## Rollback Procedure

### Rollback Application

```bash
# Stop current version
pm2 stop all

# Restore previous version
git checkout <previous-tag>
npm install
pm2 restart all
```

### Rollback Database

```bash
# Restore from backup
./scripts/restore-mongodb.sh backup_face-recognition_<timestamp>.tar.gz
```

## Post-Deployment Checklist

- [ ] All services running
- [ ] Health checks passing
- [ ] HTTPS enabled
- [ ] Backups configured
- [ ] Monitoring active
- [ ] Logs rotating
- [ ] Firewall configured
- [ ] Secrets updated
- [ ] Documentation updated
- [ ] Team notified

## Maintenance

### Regular Tasks

**Daily:**
- Check service health
- Review error logs
- Monitor disk space

**Weekly:**
- Review performance metrics
- Check backup integrity
- Update dependencies

**Monthly:**
- Security updates
- Performance optimization
- Capacity planning

### Update Procedure

```bash
# 1. Backup current state
./scripts/backup-mongodb.sh

# 2. Pull latest code
git pull origin main

# 3. Install dependencies
npm install

# 4. Run migrations
npm run migrate

# 5. Restart services
pm2 restart all

# 6. Verify deployment
curl http://localhost:5000/health
```

## Support

### Getting Help

- Documentation: `/docs`
- API Docs: `http://localhost:5000/api/docs`
- Logs: `pm2 logs` or `docker-compose logs`
- Monitoring: `http://localhost:5000/api/monitoring/metrics`

### Reporting Issues

Include:
- Error messages
- Log excerpts
- Steps to reproduce
- Environment details
- Expected vs actual behavior
