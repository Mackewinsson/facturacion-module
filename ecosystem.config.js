const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')

// Environment file resolution with better error handling
const defaultEnvFile = '.env.production'
const envFile = process.env.PM2_ENV_FILE || defaultEnvFile
const resolvedEnvPath = path.resolve(__dirname, envFile)

console.log(`🔧 Loading environment from: ${resolvedEnvPath}`)

// Load environment variables with priority order
if (fs.existsSync(resolvedEnvPath)) {
  dotenv.config({ path: resolvedEnvPath })
  console.log(`✅ Environment loaded from ${envFile}`)
} else if (fs.existsSync(path.resolve(__dirname, '.env'))) {
  dotenv.config({ path: path.resolve(__dirname, '.env') })
  console.log(`⚠️  Using fallback .env file`)
} else {
  console.log(`⚠️  No environment file found, using system environment variables`)
  dotenv.config()
}

// Validate required environment variables
const requiredVars = ['PORT', 'NODE_ENV']
const missingVars = requiredVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`)
  process.exit(1)
}

// Configure application environment
const port = process.env.PORT || '3000'
const hostname = process.env.HOSTNAME || '0.0.0.0'
const instances = parseInt(process.env.PM2_INSTANCES) || 1
const maxMemory = process.env.PM2_MAX_MEMORY || '1G'

const appEnv = Object.assign({}, process.env, {
  PORT: port,
  HOSTNAME: hostname,
  NODE_ENV: process.env.NODE_ENV || 'production'
})

console.log(`🚀 Starting application on ${hostname}:${port}`)
console.log(`📊 PM2 instances: ${instances}, max memory: ${maxMemory}`)

module.exports = {
  apps: [
    {
      name: 'recepcionactiva',
      script: 'npm',
      args: ['run', 'start'],
      interpreter: 'none',
      cwd: __dirname,
      env: appEnv,
      instances: instances,
      autorestart: true,
      watch: false,
      max_memory_restart: maxMemory,
      error_file: path.resolve(__dirname, 'logs/err.log'),
      out_file: path.resolve(__dirname, 'logs/out.log'),
      log_file: path.resolve(__dirname, 'logs/combined.log'),
      time: true,
      // Advanced PM2 options
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      // Environment-specific settings
      node_args: '--max-old-space-size=1024',
      // Health monitoring
      health_check_grace_period: 3000,
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Process management
      kill_timeout: 5000,
      listen_timeout: 3000
    }
  ]
}
