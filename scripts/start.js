#!/usr/bin/env node

/**
 * Cross-platform Production Start Script
 * 
 * This script starts the Next.js application in production mode
 * with proper environment variable loading and validation.
 * Works on both Windows and Unix systems.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper functions for colored output
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  header: (msg) => console.log(`${colors.cyan}${colors.bright}${msg}${colors.reset}`)
};

/**
 * Load environment variables from file
 */
function loadEnvironment(envFile = '.env.production') {
  const envPath = path.resolve(process.cwd(), envFile);
  
  if (fs.existsSync(envPath)) {
    log.info(`Loading environment from: ${envPath}`);
    dotenv.config({ path: envPath });
    return true;
  } else {
    log.warning(`Environment file not found: ${envPath}`);
    return false;
  }
}

/**
 * Validate required environment variables
 */
function validateEnvironment() {
  const requiredVars = ['PORT', 'NODE_ENV', 'DATABASE_URL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    log.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  log.success('Environment validation passed');
}

/**
 * Check if port is available
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      log.error(`Port ${port} is already in use`);
      process.exit(1);
    });
  });
}

/**
 * Create logs directory if it doesn't exist
 */
function setupLogs() {
  const logsDir = path.resolve(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    log.info('Creating logs directory');
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

/**
 * Start the Next.js application
 */
async function startApplication() {
  try {
    log.header('🚀 Starting RecepcionActiva Application');
    
    // Load environment variables
    loadEnvironment();
    
    // Validate environment
    validateEnvironment();
    
    // Setup logs directory
    setupLogs();
    
    // Get configuration
    const port = process.env.PORT || '3000';
    const hostname = process.env.HOSTNAME || '0.0.0.0';
    
    // Check if port is available
    await checkPort(port);
    
    log.success('Configuration validated successfully');
    log.info(`Starting Next.js on ${hostname}:${port}`);
    log.info(`Environment: ${process.env.NODE_ENV}`);
    
    // Start Next.js
    const nextProcess = spawn('npx', ['next', 'start', '-H', hostname, '-p', port], {
      stdio: 'inherit',
      shell: true
    });
    
    // Handle process events
    nextProcess.on('error', (error) => {
      log.error(`Failed to start Next.js: ${error.message}`);
      process.exit(1);
    });
    
    nextProcess.on('exit', (code) => {
      if (code !== 0) {
        log.error(`Next.js exited with code ${code}`);
        process.exit(code);
      }
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      log.info('Received SIGINT, shutting down gracefully...');
      nextProcess.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
      log.info('Received SIGTERM, shutting down gracefully...');
      nextProcess.kill('SIGTERM');
    });
    
  } catch (error) {
    log.error(`Startup error: ${error.message}`);
    process.exit(1);
  }
}

// Run the application
if (require.main === module) {
  startApplication();
}

module.exports = { startApplication };
