# 🚀 Guía de Despliegue: Frontend en Vercel + Base de Datos en Servidor Propio

Esta guía explica cómo desplegar la aplicación con el frontend en Vercel y la base de datos SQL Server en tu propio servidor.

## 📍 Ubicación de la Base de Datos

### Configuración Actual (Docker Local)

La base de datos está configurada en **Docker** usando `docker-compose.yml`:

**Ubicación del archivo:** `/Users/mackewinsson/projects/facturacion-module/docker-compose.yml`

**Configuración del contenedor:**
- **Imagen:** `mcr.microsoft.com/mssql/server:2022-latest`
- **Nombre del contenedor:** `recepcionactiva-sqlserver`
- **Puerto:** `1433` (mapeado desde el contenedor al host)
- **Usuario:** `sa`
- **Contraseña:** `sa2006Strong!`
- **Base de datos:** `MotosMunozDatos`
- **Volumen de datos:** `sqlserver_data` (persistente)

**Backup de la base de datos:**
- **Archivo:** `MotosMunozDatos 15-09-2025` (102 MB)
- **Ubicación:** `/Users/mackewinsson/projects/facturacion-module/MotosMunozDatos 15-09-2025`
- **Tipo:** Backup de SQL Server (.bak)

## 🗄️ Paso 1: Desplegar Base de Datos en tu Servidor

### Opción A: Usar Docker en tu Servidor (Recomendado)

1. **Subir archivos al servidor:**
   ```bash
   # Subir docker-compose.yml
   scp docker-compose.yml usuario@tu-servidor:/ruta/destino/
   
   # Subir backup de la base de datos
   scp "MotosMunozDatos 15-09-2025" usuario@tu-servidor:/ruta/destino/
   ```

2. **En tu servidor, crear estructura:**
   ```bash
   mkdir -p /opt/recepcionactiva/db
   cd /opt/recepcionactiva/db
   ```

3. **Copiar archivos:**
   ```bash
   # Copiar docker-compose.yml
   cp /ruta/destino/docker-compose.yml .
   
   # Copiar backup
   cp "/ruta/destino/MotosMunozDatos 15-09-2025" .
   ```

4. **Editar docker-compose.yml para producción:**
   ```yaml
   version: '3.8'
   
   services:
     sqlserver:
       image: mcr.microsoft.com/mssql/server:2022-latest
       container_name: recepcionactiva-sqlserver
       environment:
         - ACCEPT_EULA=Y
         - SA_PASSWORD=TU_PASSWORD_SEGURO_AQUI  # ⚠️ CAMBIAR ESTO
       ports:
         - "1433:1433"  # ⚠️ Considera usar un puerto diferente o firewall
       volumes:
         - sqlserver_data:/var/opt/mssql
         - ./MotosMunozDatos 15-09-2025:/var/opt/mssql/backup/MotosMunozDatos 15-09-2025:ro
       restart: unless-stopped
       healthcheck:
         test: ["CMD-SHELL", "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'TU_PASSWORD_SEGURO_AQUI' -C -Q 'SELECT 1' || exit 1"]
         interval: 30s
         timeout: 10s
         retries: 5
       networks:
         - recepcionactiva-network
   
   volumes:
     sqlserver_data:
   
   networks:
     recepcionactiva-network:
       driver: bridge
   ```

5. **Iniciar el contenedor:**
   ```bash
   docker-compose up -d sqlserver
   ```

6. **Restaurar la base de datos:**
   ```bash
   # Esperar a que el contenedor esté listo (30-60 segundos)
   sleep 60
   
   # Restaurar desde el backup
   docker exec recepcionactiva-sqlserver /opt/mssql-tools18/bin/sqlcmd \
     -S localhost \
     -U sa \
     -P 'TU_PASSWORD_SEGURO_AQUI' \
     -C \
     -Q "RESTORE DATABASE MotosMunozDatos FROM DISK = '/var/opt/mssql/backup/MotosMunozDatos 15-09-2025' WITH MOVE 'SecoemurDatos' TO '/var/opt/mssql/data/MotosMunozDatos.mdf', MOVE 'SecoemurDatos_log' TO '/var/opt/mssql/data/MotosMunozDatos_log.ldf'"
   ```

7. **Verificar que la base de datos está funcionando:**
   ```bash
   docker exec recepcionactiva-sqlserver /opt/mssql-tools18/bin/sqlcmd \
     -S localhost \
     -U sa \
     -P 'TU_PASSWORD_SEGURO_AQUI' \
     -C \
     -Q "SELECT name FROM sys.databases WHERE name = 'MotosMunozDatos'"
   ```

### Opción B: Instalar SQL Server Directamente en el Servidor

Si prefieres no usar Docker:

1. **Instalar SQL Server 2022 en tu servidor** (Linux/Windows)
2. **Configurar usuario y contraseña**
3. **Restaurar el backup:**
   ```bash
   # En Linux
   sqlcmd -S localhost -U sa -P 'TU_PASSWORD' -C \
     -Q "RESTORE DATABASE MotosMunozDatos FROM DISK = '/ruta/al/backup/MotosMunozDatos 15-09-2025' WITH MOVE 'SecoemurDatos' TO '/var/opt/mssql/data/MotosMunozDatos.mdf', MOVE 'SecoemurDatos_log' TO '/var/opt/mssql/data/MotosMunozDatos_log.ldf'"
   ```

## 🔒 Paso 2: Configurar Seguridad y Acceso

### Firewall y Red

1. **Abrir puerto 1433 en el firewall:**
   ```bash
   # Linux (ufw)
   sudo ufw allow 1433/tcp
   
   # Linux (firewalld)
   sudo firewall-cmd --add-port=1433/tcp --permanent
   sudo firewall-cmd --reload
   ```

2. **Configurar SQL Server para aceptar conexiones remotas:**
   ```sql
   -- Habilitar protocolo TCP/IP
   EXEC sp_configure 'remote access', 1;
   RECONFIGURE;
   
   -- Habilitar autenticación SQL Server
   ALTER LOGIN sa ENABLE;
   ```

3. **Crear usuario específico para la aplicación (recomendado):**
   ```sql
   CREATE LOGIN app_user WITH PASSWORD = 'PASSWORD_SEGURO_AQUI';
   USE MotosMunozDatos;
   CREATE USER app_user FOR LOGIN app_user;
   ALTER ROLE db_datareader ADD MEMBER app_user;
   ALTER ROLE db_datawriter ADD MEMBER app_user;
   ```

### Obtener IP Pública del Servidor

```bash
# En tu servidor
curl ifconfig.me
# O
hostname -I
```

## 🌐 Paso 3: Configurar Vercel

### Variables de Entorno en Vercel

1. **Ir a tu proyecto en Vercel Dashboard**
2. **Settings → Environment Variables**
3. **Agregar las siguientes variables:**

```bash
# Base de datos (reemplazar con IP de tu servidor)
DATABASE_URL=sqlserver://sa:TU_PASSWORD@TU_IP_SERVIDOR:1433;database=MotosMunozDatos;trustServerCertificate=true

# O si creaste un usuario específico:
DATABASE_URL=sqlserver://app_user:TU_PASSWORD@TU_IP_SERVIDOR:1433;database=MotosMunozDatos;trustServerCertificate=true

# Variables individuales (si las usas)
DB_HOST=TU_IP_SERVIDOR
DB_PORT=1433
DB_USER=sa
DB_PASS=TU_PASSWORD
DB_NAME=MotosMunozDatos

# JWT Secret (generar uno nuevo y seguro)
JWT_SECRET=GENERA_UNA_CLAVE_SECRETA_ALEATORIA_DE_AL_MENOS_32_CARACTERES

# FTP (si lo necesitas)
FTP_HOST=192.168.8.10
FTP_PORT=21
FTP_USER=usermw
FTP_PASSWORD=usermw
FTP_BASE_PATH=/uploads/orders
FTP_HTTP_BASE_URL=http://192.168.8.10/uploads

# Aplicación
NODE_ENV=production
APP_URL=https://tu-dominio.vercel.app
```

### Generar JWT Secret Seguro

```bash
# En tu terminal local
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Configurar Next.js para Vercel

El proyecto ya está configurado para Vercel. Solo asegúrate de:

1. **Verificar `next.config.ts`** - Debe estar configurado correctamente
2. **Build Command:** `npm run build` (por defecto)
3. **Output Directory:** `.next` (por defecto)

## 🔧 Paso 4: Configurar Conexión desde Vercel

### Problema: Vercel Serverless Functions y SQL Server

Vercel usa funciones serverless que pueden tener problemas conectándose directamente a SQL Server debido a:
- Timeouts de conexión
- IPs dinámicas
- Firewall del servidor

### Solución: Usar API Routes como Proxy

Las rutas API de Next.js (`/api/*`) ya están configuradas y funcionarán en Vercel. Sin embargo, necesitas asegurar:

1. **Que el servidor SQL Server acepte conexiones desde las IPs de Vercel**
   - Vercel tiene IPs dinámicas, así que considera:
     - Permitir conexiones desde cualquier IP (menos seguro)
     - O usar un servicio de proxy/túnel

2. **Configurar timeout más largo en Prisma:**
   ```typescript
   // src/lib/prisma.ts
   // Ya debería estar configurado, pero verifica
   ```

### Alternativa: Usar un Túnel o Proxy

Si tu servidor está detrás de un firewall estricto, considera:

1. **Usar Cloudflare Tunnel** (gratis)
2. **Usar ngrok** (para desarrollo/testing)
3. **Configurar un reverse proxy** en tu servidor

## 📋 Checklist de Despliegue

### Servidor de Base de Datos

- [ ] Docker instalado en el servidor (si usas Docker)
- [ ] SQL Server corriendo y accesible
- [ ] Backup restaurado correctamente
- [ ] Puerto 1433 abierto en firewall
- [ ] SQL Server configurado para conexiones remotas
- [ ] Usuario y contraseña configurados
- [ ] IP pública del servidor obtenida
- [ ] Conexión de prueba desde fuera del servidor exitosa

### Vercel

- [ ] Proyecto creado en Vercel
- [ ] Repositorio conectado
- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET generado y configurado
- [ ] DATABASE_URL apunta a tu servidor
- [ ] Build exitoso en Vercel
- [ ] Deploy completado

### Verificación

- [ ] Login funciona
- [ ] API endpoints responden correctamente
- [ ] Datos se cargan desde la base de datos
- [ ] No hay errores en los logs de Vercel
- [ ] No hay errores en los logs del servidor SQL Server

## 🧪 Probar Conexión

### Desde tu máquina local (antes de desplegar en Vercel)

```bash
# Crear archivo .env.production temporal
cat > .env.production << EOF
DATABASE_URL=sqlserver://sa:TU_PASSWORD@TU_IP_SERVIDOR:1433;database=MotosMunozDatos;trustServerCertificate=true
DB_HOST=TU_IP_SERVIDOR
DB_PORT=1433
DB_USER=sa
DB_PASS=TU_PASSWORD
DB_NAME=MotosMunozDatos
JWT_SECRET=TU_JWT_SECRET
NODE_ENV=production
EOF

# Probar conexión
node scripts/test-db-connection.js
```

## 🐛 Troubleshooting

### Error: "Cannot connect to SQL Server"

1. **Verificar que SQL Server está corriendo:**
   ```bash
   docker ps | grep sqlserver
   # O
   systemctl status mssql-server
   ```

2. **Verificar firewall:**
   ```bash
   # Desde fuera del servidor
   telnet TU_IP_SERVIDOR 1433
   ```

3. **Verificar credenciales:**
   ```bash
   sqlcmd -S TU_IP_SERVIDOR -U sa -P TU_PASSWORD -C -Q "SELECT 1"
   ```

### Error: "Login failed for user"

- Verificar que el usuario existe y tiene permisos
- Verificar que la contraseña es correcta
- Verificar que SQL Server Authentication está habilitada

### Error: "Connection timeout" en Vercel

- Verificar que el servidor acepta conexiones desde IPs externas
- Considerar usar un túnel o proxy
- Aumentar timeout en Prisma (si es posible)

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs de Vercel: Dashboard → Deployments → Logs
2. Revisa los logs del servidor SQL Server
3. Prueba la conexión desde tu máquina local primero
4. Verifica todas las variables de entorno

---

**Nota importante:** Asegúrate de cambiar todas las contraseñas por defecto antes de desplegar en producción.

