#!/bin/bash

echo "🔄 Restoring MotosMunozDatos database from backup..."

# Check if container is running
if ! docker ps --format 'table {{.Names}}' | grep -q "^sql1$"; then
    echo "❌ SQL Server container is not running. Please start it first with:"
    echo "   ./scripts/start-db.sh"
    exit 1
fi

# Create backup directory if it doesn't exist
echo "📁 Creating backup directory..."
docker exec sql1 mkdir -p /var/opt/mssql/backup

# Copy backup file to container
echo "📋 Copying backup file to container..."
docker cp "MotosMunozDatos 15-09-2025" sql1:/var/opt/mssql/backup/

# Restore database
echo "🔄 Restoring database..."
docker exec sql1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'sa2006Strong!' -C -Q "RESTORE DATABASE MotosMunozDatos FROM DISK = '/var/opt/mssql/backup/MotosMunozDatos 15-09-2025' WITH MOVE 'SecoemurDatos' TO '/var/opt/mssql/data/MotosMunozDatos.mdf', MOVE 'SecoemurDatos_log' TO '/var/opt/mssql/data/MotosMunozDatos_log.ldf'"

echo "✅ Database restored successfully!"
echo "🔗 You can now connect to MotosMunozDatos database"
