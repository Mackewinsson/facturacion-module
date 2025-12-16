#!/bin/bash

# Script para verificar la conexión a la base de datos desde Vercel
# Ejecutar en el servidor: ./scripts/verify-db-connection.sh

echo "🔍 Verificando configuración de base de datos para Vercel..."
echo ""

# Configuración esperada
DB_HOST="91.98.198.164"
DB_PORT="1433"
DB_USER="sa"
DB_PASS="sa2006Strong!"
DB_NAME="MotosMunozDatos"

echo "📋 Configuración esperada:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   User: $DB_USER"
echo "   Database: $DB_NAME"
echo ""

# Verificar que el contenedor está corriendo
echo "1. Verificando contenedor SQL Server..."
if sudo docker ps | grep -q recepcionactiva-sqlserver; then
    echo "   ✅ Contenedor recepcionactiva-sqlserver está corriendo"
    CONTAINER_STATUS=$(sudo docker ps | grep recepcionactiva-sqlserver | awk '{print $7}')
    echo "   Estado: $CONTAINER_STATUS"
else
    echo "   ❌ Contenedor recepcionactiva-sqlserver NO está corriendo"
    echo "   Ejecuta: cd /srv/docker/infra && sudo docker compose up -d sqlserver"
    exit 1
fi
echo ""

# Verificar que SQL Server está listo
echo "2. Verificando que SQL Server está listo..."
if sudo docker exec recepcionactiva-sqlserver /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P 'sa2006Strong!' -C -Q "SELECT 1" &>/dev/null; then
    echo "   ✅ SQL Server está respondiendo"
else
    echo "   ⚠️  SQL Server no está listo todavía, espera 60-90 segundos"
fi
echo ""

# Verificar que la base de datos existe
echo "3. Verificando que la base de datos existe..."
DB_EXISTS=$(sudo docker exec recepcionactiva-sqlserver /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P 'sa2006Strong!' -C -Q "SELECT name FROM sys.databases WHERE name = 'MotosMunozDatos'" \
    -h -1 -W 2>/dev/null | grep -i MotosMunozDatos)

if [ -n "$DB_EXISTS" ]; then
    echo "   ✅ Base de datos 'MotosMunozDatos' existe"
else
    echo "   ❌ Base de datos 'MotosMunozDatos' NO existe"
    echo "   Necesitas restaurar el backup primero"
    exit 1
fi
echo ""

# Verificar que tiene datos
echo "4. Verificando que la base de datos tiene datos..."
ENT_COUNT=$(sudo docker exec recepcionactiva-sqlserver /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P 'sa2006Strong!' -C -d MotosMunozDatos \
    -Q "SELECT COUNT(*) FROM ENT" -h -1 -W 2>/dev/null | grep -E '^[0-9]+$' | head -1)

CFA_COUNT=$(sudo docker exec recepcionactiva-sqlserver /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P 'sa2006Strong!' -C -d MotosMunozDatos \
    -Q "SELECT COUNT(*) FROM CFA" -h -1 -W 2>/dev/null | grep -E '^[0-9]+$' | head -1)

if [ -n "$ENT_COUNT" ] && [ -n "$CFA_COUNT" ]; then
    echo "   ✅ Base de datos tiene datos:"
    echo "      - Entidades: $ENT_COUNT"
    echo "      - Facturas: $CFA_COUNT"
else
    echo "   ⚠️  No se pudo verificar los datos"
fi
echo ""

# Verificar puerto abierto
echo "5. Verificando que el puerto 1433 está abierto..."
if sudo netstat -tlnp 2>/dev/null | grep -q ":1433 " || sudo ss -tlnp 2>/dev/null | grep -q ":1433 "; then
    echo "   ✅ Puerto 1433 está abierto"
else
    echo "   ⚠️  No se pudo verificar el puerto (puede requerir permisos)"
fi
echo ""

# Probar conexión desde fuera (simulando Vercel)
echo "6. Probando conexión externa (simulando Vercel)..."
if command -v sqlcmd &> /dev/null; then
    if sqlcmd -S "$DB_HOST,$DB_PORT" -U "$DB_USER" -P "$DB_PASS" -C \
        -d "$DB_NAME" -Q "SELECT @@VERSION" &>/dev/null; then
        echo "   ✅ Conexión externa exitosa"
    else
        echo "   ⚠️  No se pudo conectar desde fuera (puede ser normal si no tienes sqlcmd local)"
    fi
else
    echo "   ⚠️  sqlcmd no está instalado localmente, no se puede probar conexión externa"
fi
echo ""

# Mostrar DATABASE_URL para Vercel
echo "📝 Variable de entorno para Vercel:"
echo ""
echo "DATABASE_URL=\"sqlserver://sa:sa2006Strong!@91.98.198.164:1433;database=MotosMunozDatos;trustServerCertificate=true\""
echo ""
echo "✅ Verificación completada"

