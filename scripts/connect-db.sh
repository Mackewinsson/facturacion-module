#!/bin/bash

# Connect to SQL Server database
# Usage: ./scripts/connect-db.sh

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Set defaults
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-1433}
DB_USER=${DB_USER:-sa}
DB_PASS=${DB_PASS:-sa2006Strong!}
DB_NAME=${DB_NAME:-MotosMunozDatos}

echo "🔌 Connecting to SQL Server..."
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Check if Docker container sql1 is available (check password from container)
if docker ps --format '{{.Names}}' | grep -q "^sql1$"; then
    echo "Using Docker container sql1..."
    # Try to get password from container, fallback to env var
    CONTAINER_PASS=$(docker inspect sql1 --format '{{range .Config.Env}}{{println .}}{{end}}' | grep SA_PASSWORD | cut -d'=' -f2)
    if [ -n "$CONTAINER_PASS" ]; then
        echo "   Using password from container configuration"
        docker exec -it sql1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U "$DB_USER" -P "$CONTAINER_PASS" -d "$DB_NAME" -C "$@"
    else
        docker exec -it sql1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U "$DB_USER" -P "$DB_PASS" -d "$DB_NAME" -C "$@"
    fi
# Check if Docker container recepcionactiva-sqlserver is available
elif docker ps --format '{{.Names}}' | grep -q "recepcionactiva-sqlserver"; then
    echo "Using Docker container recepcionactiva-sqlserver..."
    docker exec -it recepcionactiva-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U "$DB_USER" -P "$DB_PASS" -d "$DB_NAME" -C "$@"
# Check if sqlcmd is available locally
elif command -v sqlcmd &> /dev/null; then
    echo "Using local sqlcmd..."
    sqlcmd -S "$DB_HOST,$DB_PORT" -U "$DB_USER" -P "$DB_PASS" -d "$DB_NAME" -C "$@"
else
    echo "❌ Error: No SQL Server connection method available"
    echo "   Please ensure sqlcmd is installed or a Docker container is running"
    exit 1
fi

