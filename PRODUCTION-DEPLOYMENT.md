# 🚀 Production Deployment Guide

This guide covers how to deploy the RecepcionActiva application to production with proper environment configuration and port management.

## 📋 Prerequisites

- Node.js 18+ installed
- PM2 process manager installed globally: `npm install -g pm2`
- Access to your production server
- Database server running and accessible
- FTP server configured and accessible

## 🔧 Environment Configuration

### 1. Create Production Environment File

Copy the example environment file and customize it for your production environment:

```bash
cp env.production.example .env.production
```

### 2. Configure Environment Variables

Edit `.env.production` with your production values:

#### Server Configuration
```bash
# Set your desired port
PORT=3000
HOSTNAME=0.0.0.0
NODE_ENV=production

# Application URL (update with your domain/IP)
APP_URL=http://your-domain.com:3000
```

#### Database Configuration
```bash
# Update with your production database details
DB_HOST=your-db-host
DB_PORT=1433
DB_USER=your-db-user
DB_PASS=your-secure-password
DB_NAME=your-database-name

# Update the DATABASE_URL accordingly
DATABASE_URL="sqlserver://your-db-user:your-secure-password@your-db-host:1433;database=your-database-name;trustServerCertificate=true"
```

#### FTP Configuration
```bash
# Update with your production FTP server details
FTP_HOST=your-ftp-host
FTP_PORT=21
FTP_USER=your-ftp-user
FTP_PASSWORD=your-ftp-password
FTP_BASE_PATH=/uploads/orders
FTP_HTTP_BASE_URL=http://your-ftp-host/uploads
```

#### Security Configuration
```bash
# Generate strong secrets (use a password generator)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
SESSION_SECRET=your-session-secret-at-least-32-characters-long
```

### 3. Validate Environment Configuration

Before deploying, validate your environment configuration:

```bash
# Validate the environment file
npm run validate-env

# Generate a new template if needed
npm run validate-env:template
```

## 🚀 Deployment Options

### Option 1: Direct Start (Simple)

**Linux/macOS:**
```bash
# Build the application
npm run build

# Start the application
npm start
```

**Windows:**
```cmd
# Build the application (with Windows-specific cleaning)
npm run build:windows

# Start the application
npm run start:windows
```

The application will start on the port specified in your `.env.production` file.

### Option 2: PM2 Process Manager (Recommended)

For production deployments with process management, monitoring, and auto-restart:

**Linux/macOS:**
```bash
# Build the application
npm run build

# Start with PM2
npm run deploy:start

# Check status
npm run deploy:status

# View logs
npm run deploy:logs

# Monitor in real-time
npm run deploy:monit
```

**Windows:**
```cmd
# Build the application (with Windows-specific cleaning)
npm run build:windows

# Start with PM2
npm run deploy:start

# Check status
npm run deploy:status

# View logs
npm run deploy:logs

# Monitor in real-time
npm run deploy:monit
```

## 🔍 Port Configuration

### Setting a Custom Port

To run the application on a specific port, update your `.env.production` file:

```bash
# Example: Run on port 8080
PORT=8080
APP_URL=http://your-domain.com:8080
```

### Port Validation

The deployment scripts will automatically:
- Validate that the port is a valid number (1-65535)
- Check if the port is available before starting
- Display clear error messages if the port is already in use

### Common Port Configurations

```bash
# Standard web port
PORT=80

# HTTPS port
PORT=443

# Custom application port
PORT=3000

# Alternative ports
PORT=8080
PORT=5000
```

## 📊 Monitoring and Management

### PM2 Commands

```bash
# Start the application
npm run deploy:start

# Stop the application
npm run deploy:stop

# Restart the application
npm run deploy:restart

# Check application status
npm run deploy:status

# View real-time logs
npm run deploy:logs

# Monitor performance
npm run deploy:monit
```

### Log Files

Logs are automatically created in the `logs/` directory:
- `logs/out.log` - Application output
- `logs/err.log` - Error logs
- `logs/combined.log` - Combined logs

### Health Checks

The application includes built-in health monitoring:
- Automatic restart on crashes
- Memory limit monitoring
- Process health checks

## 🔒 Security Considerations

### Environment File Security

- Never commit `.env.production` to version control
- Use strong, unique passwords and secrets
- Restrict file permissions: `chmod 600 .env.production`
- Regularly rotate secrets and passwords

### Network Security

- Configure firewall rules for your chosen port
- Use HTTPS in production (configure reverse proxy)
- Implement proper CORS settings
- Regular security updates

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use

**Linux/macOS:**
```bash
# Check what's using the port
lsof -i :3000

# Kill the process if needed
kill -9 <PID>
```

**Windows:**
```cmd
# Check what's using the port
netstat -ano | findstr :3000

# Kill the process if needed (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### Build Permission Errors (Windows)

**Error:** `EPERM: operation not permitted, mkdir 'C:\RecepcionActiva\.next\types'`

**Solution:**
```cmd
# Clean build artifacts and rebuild
npm run build:windows

# Or manually clean and rebuild
npm run clean:windows
npm run build
```

**Alternative Solutions:**
1. Run Command Prompt as Administrator
2. Check antivirus software isn't blocking file operations
3. Ensure no other processes are using the `.next` directory
4. Try building without Turbopack: `next build`

#### Environment Validation Errors
```bash
# Validate your environment
npm run validate-env

# Check for missing variables
cat .env.production | grep -v '^#' | grep -v '^$'
```

**Windows:**
```cmd
# Check for missing variables
findstr /v "^#" .env.production | findstr /v "^$"
```

#### Database Connection Issues
- Verify database server is running
- Check network connectivity
- Validate database credentials
- Ensure firewall allows database port

#### FTP Connection Issues
- Verify FTP server is accessible
- Check FTP credentials
- Test FTP connection manually
- Validate FTP paths exist

### Debug Mode

For debugging, you can run with more verbose logging:

```bash
# Set debug log level
LOG_LEVEL=debug

# Start with PM2
npm run deploy:start
```

## 📈 Performance Optimization

### PM2 Configuration

The `ecosystem.config.js` includes optimized settings:
- Memory limit monitoring
- Automatic restarts
- Process clustering (configurable)
- Log rotation

### Environment Variables for Performance

```bash
# Adjust based on your server capacity
PM2_INSTANCES=2
PM2_MAX_MEMORY=2G

# Database connection pool
DB_POOL_MIN=2
DB_POOL_MAX=10

# Request timeout
REQUEST_TIMEOUT=30000
```

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build the application
npm run build

# Restart with PM2
npm run deploy:restart
```

### Database Migrations

```bash
# Run Prisma migrations
npx prisma migrate deploy
```

### Backup Procedures

- Regular database backups
- Environment file backups
- Application log backups
- Configuration backups

## 📞 Support

If you encounter issues during deployment:

1. Check the logs: `npm run deploy:logs`
2. Validate environment: `npm run validate-env`
3. Check PM2 status: `npm run deploy:status`
4. Review this documentation
5. Check server resources (CPU, memory, disk)

## 🎯 Quick Start Checklist

- [ ] Copy `env.production.example` to `.env.production`
- [ ] Update all environment variables with production values
- [ ] Generate strong secrets for JWT and session
- [ ] Validate environment: `npm run validate-env`
- [ ] Build application: `npm run build`
- [ ] Start with PM2: `npm run deploy:start`
- [ ] Verify deployment: `npm run deploy:status`
- [ ] Test application functionality
- [ ] Configure firewall for your port
- [ ] Set up monitoring and alerts

---

**Note**: Always test your configuration in a staging environment before deploying to production.
