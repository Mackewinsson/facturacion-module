#!/usr/bin/env node

/**
 * Environment Validation Script
 * 
 * This script validates that all required environment variables are present
 * and properly configured for production deployment.
 */

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

// Required environment variables with validation rules
const requiredVars = {
  // Server Configuration
  PORT: {
    required: true,
    type: 'number',
    min: 1,
    max: 65535,
    description: 'Server port number'
  },
  NODE_ENV: {
    required: true,
    type: 'string',
    allowedValues: ['production', 'development', 'test'],
    description: 'Node.js environment'
  },
  HOSTNAME: {
    required: false,
    type: 'string',
    default: '0.0.0.0',
    description: 'Server hostname'
  },

  // Application Configuration
  APP_URL: {
    required: true,
    type: 'url',
    description: 'Application base URL'
  },

  // Database Configuration
  DATABASE_URL: {
    required: true,
    type: 'string',
    pattern: /^sqlserver:\/\//,
    description: 'Database connection URL'
  },
  DB_HOST: {
    required: true,
    type: 'string',
    description: 'Database host'
  },
  DB_PORT: {
    required: true,
    type: 'number',
    min: 1,
    max: 65535,
    description: 'Database port'
  },
  DB_USER: {
    required: true,
    type: 'string',
    description: 'Database username'
  },
  DB_PASS: {
    required: true,
    type: 'string',
    minLength: 1,
    description: 'Database password'
  },
  DB_NAME: {
    required: true,
    type: 'string',
    description: 'Database name'
  },

  // FTP Configuration
  FTP_HOST: {
    required: true,
    type: 'string',
    description: 'FTP server host'
  },
  FTP_PORT: {
    required: true,
    type: 'number',
    min: 1,
    max: 65535,
    description: 'FTP server port'
  },
  FTP_USER: {
    required: true,
    type: 'string',
    description: 'FTP username'
  },
  FTP_PASSWORD: {
    required: true,
    type: 'string',
    minLength: 1,
    description: 'FTP password'
  },
  FTP_BASE_PATH: {
    required: true,
    type: 'string',
    description: 'FTP base path'
  },
  FTP_SECURE: {
    required: false,
    type: 'string',
    allowedValues: ['true', 'false'],
    default: 'false',
    description: 'FTP secure connection'
  },
  FTP_HTTP_BASE_URL: {
    required: true,
    type: 'url',
    description: 'FTP HTTP base URL'
  }
};

// Optional environment variables with defaults
const optionalVars = {
  PM2_ENV_FILE: {
    type: 'string',
    default: '.env.production',
    description: 'PM2 environment file'
  },
  PM2_INSTANCES: {
    type: 'number',
    default: 1,
    min: 1,
    max: 10,
    description: 'PM2 instance count'
  },
  PM2_MAX_MEMORY: {
    type: 'string',
    default: '1G',
    pattern: /^\d+[GMK]?$/,
    description: 'PM2 max memory limit'
  }
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
 * Validate a single environment variable
 */
function validateVariable(varName, value, rules) {
  const errors = [];
  const warnings = [];

  // Check if required variable is present
  if (rules.required && (!value || value.trim() === '')) {
    errors.push(`${varName} is required but not set`);
    return { valid: false, errors, warnings };
  }

  // Skip validation if value is empty and not required
  if (!value || value.trim() === '') {
    return { valid: true, errors, warnings };
  }

  // Type validation
  if (rules.type === 'number') {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      errors.push(`${varName} must be a number, got: ${value}`);
    } else {
      if (rules.min !== undefined && numValue < rules.min) {
        errors.push(`${varName} must be at least ${rules.min}, got: ${numValue}`);
      }
      if (rules.max !== undefined && numValue > rules.max) {
        errors.push(`${varName} must be at most ${rules.max}, got: ${numValue}`);
      }
    }
  }

  if (rules.type === 'string') {
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      errors.push(`${varName} must be at least ${rules.minLength} characters long`);
    }
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      errors.push(`${varName} must be at most ${rules.maxLength} characters long`);
    }
  }

  if (rules.type === 'url') {
    try {
      new URL(value);
    } catch (e) {
      errors.push(`${varName} must be a valid URL, got: ${value}`);
    }
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push(`${varName} format is invalid, got: ${value}`);
  }

  // Allowed values validation
  if (rules.allowedValues && !rules.allowedValues.includes(value)) {
    errors.push(`${varName} must be one of: ${rules.allowedValues.join(', ')}, got: ${value}`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Main validation function
 */
function validateEnvironment() {
  log.header('🔍 Environment Validation Report');
  console.log('');

  let hasErrors = false;
  let hasWarnings = false;

  // Validate required variables
  log.info('Validating required environment variables...');
  for (const [varName, rules] of Object.entries(requiredVars)) {
    const value = process.env[varName];
    const result = validateVariable(varName, value, rules);
    
    if (!result.valid) {
      hasErrors = true;
      result.errors.forEach(error => log.error(`  ${error}`));
    } else {
      log.success(`  ✓ ${varName}: ${value || 'not set'}`);
    }
  }

  console.log('');

  // Validate optional variables
  log.info('Validating optional environment variables...');
  for (const [varName, rules] of Object.entries(optionalVars)) {
    const value = process.env[varName];
    const result = validateVariable(varName, value, rules);
    
    if (!result.valid) {
      hasWarnings = true;
      result.errors.forEach(error => log.warning(`  ${error}`));
    } else {
      const displayValue = value || `(default: ${rules.default})`;
      log.success(`  ✓ ${varName}: ${displayValue}`);
    }
  }

  console.log('');

  // Summary
  if (hasErrors) {
    log.error('❌ Environment validation failed!');
    process.exit(1);
  } else if (hasWarnings) {
    log.warning('⚠️  Environment validation completed with warnings');
  } else {
    log.success('✅ Environment validation passed!');
  }

  return !hasErrors;
}

/**
 * Generate environment template
 */
function generateTemplate() {
  log.header('📝 Generating environment template...');
  
  const template = [];
  template.push('# ===========================================');
  template.push('# PRODUCTION ENVIRONMENT CONFIGURATION');
  template.push('# ===========================================');
  template.push('# Copy this file to .env.production and update the values');
  template.push('');

  // Required variables
  template.push('# ===========================================');
  template.push('# REQUIRED VARIABLES');
  template.push('# ===========================================');
  for (const [varName, rules] of Object.entries(requiredVars)) {
    template.push(`# ${rules.description}`);
    template.push(`${varName}=your_${varName.toLowerCase()}_here`);
    template.push('');
  }

  // Optional variables
  template.push('# ===========================================');
  template.push('# OPTIONAL VARIABLES (with defaults)');
  template.push('# ===========================================');
  for (const [varName, rules] of Object.entries(optionalVars)) {
    template.push(`# ${rules.description} (default: ${rules.default})`);
    template.push(`# ${varName}=${rules.default}`);
    template.push('');
  }

  const templateContent = template.join('\n');
  const templatePath = path.resolve(process.cwd(), '.env.template');
  
  fs.writeFileSync(templatePath, templateContent);
  log.success(`Template generated: ${templatePath}`);
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: node validate-env.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --help, -h     Show this help message');
    console.log('  --template     Generate environment template');
    console.log('  --env <file>   Specify environment file (default: .env.production)');
    console.log('');
    process.exit(0);
  }

  if (args.includes('--template')) {
    generateTemplate();
    return;
  }

  const envFileIndex = args.indexOf('--env');
  const envFile = envFileIndex !== -1 && args[envFileIndex + 1] 
    ? args[envFileIndex + 1] 
    : '.env.production';

  loadEnvironment(envFile);
  validateEnvironment();
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  validateEnvironment,
  loadEnvironment,
  generateTemplate
};
