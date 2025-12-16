# 📍 Resumen: Ubicación de la Base de Datos y Despliegue

## 🗄️ Base de Datos - Información Actual

### Ubicación del Docker Compose
**Archivo:** `docker-compose.yml` (raíz del proyecto)

### Configuración del Contenedor
- **Imagen:** `mcr.microsoft.com/mssql/server:2022-latest`
- **Contenedor:** `recepcionactiva-sqlserver`
- **Puerto:** `1433`
- **Usuario:** `sa`
- **Contraseña:** `sa2006Strong!` ⚠️ **CAMBIAR EN PRODUCCIÓN**
- **Base de datos:** `MotosMunozDatos`

### Backup de la Base de Datos
- **Archivo:** `MotosMunozDatos 15-09-2025` (102 MB)
- **Ubicación:** Raíz del proyecto
- **Tipo:** Backup SQL Server (.bak)

## 🚀 Pasos Rápidos para Desplegar

### 1. En tu Servidor (Base de Datos)

```bash
# 1. Subir archivos
scp docker-compose.yml usuario@servidor:/opt/recepcionactiva/
scp "MotosMunozDatos 15-09-2025" usuario@servidor:/opt/recepcionactiva/

# 2. En el servidor, iniciar Docker
cd /opt/recepcionactiva
docker-compose up -d sqlserver

# 3. Restaurar base de datos (esperar 60 segundos primero)
docker exec recepcionactiva-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'sa2006Strong!' -C \
  -Q "RESTORE DATABASE MotosMunozDatos FROM DISK = '/var/opt/mssql/backup/MotosMunozDatos 15-09-2025' WITH MOVE 'SecoemurDatos' TO '/var/opt/mssql/data/MotosMunozDatos.mdf', MOVE 'SecoemurDatos_log' TO '/var/opt/mssql/data/MotosMunozDatos_log.ldf'"

# 4. Obtener IP del servidor
curl ifconfig.me
```

### 2. En Vercel (Frontend)

1. **Ir a:** Settings → Environment Variables
2. **Agregar:**
   ```
   DATABASE_URL=sqlserver://sa:TU_PASSWORD@TU_IP_SERVIDOR:1433;database=MotosMunozDatos;trustServerCertificate=true
   JWT_SECRET=GENERA_UNA_CLAVE_SECRETA_ALEATORIA
   NODE_ENV=production
   APP_URL=https://tu-dominio.vercel.app
   ```

3. **Deploy:** Vercel detectará automáticamente los cambios

## 📚 Documentación Completa

Para instrucciones detalladas, ver: **[docs/DEPLOYMENT-GUIDE.md](docs/DEPLOYMENT-GUIDE.md)**

## ⚠️ Importante

1. **Cambiar contraseña por defecto** antes de producción
2. **Configurar firewall** para permitir conexiones en puerto 1433
3. **Generar JWT_SECRET seguro** (32+ caracteres aleatorios)
4. **Probar conexión** desde fuera del servidor antes de desplegar en Vercel

## 🔍 Archivos Clave

- `docker-compose.yml` - Configuración Docker
- `MotosMunozDatos 15-09-2025` - Backup de la base de datos
- `env.production.example` - Ejemplo de variables de entorno
- `docs/DEPLOYMENT-GUIDE.md` - Guía completa de despliegue

