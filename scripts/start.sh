#!/bin/bash

# ===========================================
# PRODUCTION START SCRIPT
# ===========================================
# This script starts the Next.js application in production mode
# with proper environment variable loading and validation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to validate environment variables
validate_env() {
    local missing_vars=()
    
    # Check required variables
    if [ -z "$PORT" ]; then
        missing_vars+=("PORT")
    fi
    
    if [ -z "$NODE_ENV" ]; then
        missing_vars+=("NODE_ENV")
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        missing_vars+=("DATABASE_URL")
    fi
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables: ${missing_vars[*]}"
        exit 1
    fi
}

# Function to load environment variables
load_env() {
    local env_file=".env.production"
    
    if [ -f "$env_file" ]; then
        print_status "Loading environment from $env_file"
        
        # Load environment variables, ignoring comments and empty lines
        while IFS= read -r line; do
            # Skip comments and empty lines
            if [[ ! "$line" =~ ^[[:space:]]*# ]] && [[ -n "$line" ]]; then
                # Export the variable
                export "$line"
            fi
        done < "$env_file"
        
        print_success "Environment variables loaded successfully"
    else
        print_warning "Environment file $env_file not found, using system environment variables"
    fi
}

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_error "Port $port is already in use"
        exit 1
    fi
}

# Function to create logs directory if it doesn't exist
setup_logs() {
    if [ ! -d "logs" ]; then
        print_status "Creating logs directory"
        mkdir -p logs
    fi
}

# Main execution
main() {
    print_status "Starting RecepcionActiva application..."
    
    # Load environment variables
    load_env
    
    # Validate required environment variables
    validate_env
    
    # Setup logs directory
    setup_logs
    
    # Set defaults
    local port=${PORT:-3000}
    local hostname=${HOSTNAME:-0.0.0.0}
    
    # Check if port is available
    check_port $port
    
    print_success "Configuration validated successfully"
    print_status "Starting Next.js on $hostname:$port"
    print_status "Environment: $NODE_ENV"
    
    # Start the application
    exec next start -H $hostname -p $port
}

# Run main function
main "$@"
