# 🔗 Configuración de Base de Datos para Vercel

## ✅ Verificación de Configuración

### Estado Actual del Servidor

- **IP del Servidor:** `91.98.198.164`
- **Puerto:** `1433` ✅ (Verificado - puerto abierto y accesible)
- **Contenedor:** `recepcionactiva-sqlserver`
- **Base de Datos:** `MotosMunozDatos`
- **Usuario:** `sa`
- **Contraseña:** `sa2006Strong!`

### Configuración del Docker Compose

El servicio SQL Server está configurado en `/srv/docker/infra/docker-compose.yml`:

```yaml
sqlserver:
  image: mcr.microsoft.com/mssql/server:2022-latest
  container_name: recepcionactiva-sqlserver
  environment:
    - ACCEPT_EULA=Y
    - SA_PASSWORD=${DB_SA_PASSWORD}
  ports:
    - "1433:1433"
```

La contraseña está configurada en `/srv/docker/infra/.env`:
```
DB_SA_PASSWORD=sa2006Strong!
```

## 📝 Variable de Entorno para Vercel

### En el Dashboard de Vercel:

1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Agrega la siguiente variable:

**Name:** `DATABASE_URL`  
**Value:** 
```
sqlserver://sa:sa2006Strong!@91.98.198.164:1433;database=MotosMunozDatos;trustServerCertificate=true
```

**Environments:** 
- ✅ Production
- ✅ Preview (opcional, si quieres probar en previews)

### Variables Adicionales (Opcionales)

Si tu aplicación usa variables individuales además de `DATABASE_URL`, también agrega:

```
DB_HOST=91.98.198.164
DB_PORT=1433
DB_USER=sa
DB_PASS=sa2006Strong!
DB_NAME=MotosMunozDatos
```

## 🔍 Verificación

### Para verificar que todo está correcto, ejecuta en el servidor:

```bash
# Copiar el script de verificación al servidor
scp scripts/verify-db-connection.sh mackewinsson@91.98.198.164:/tmp/

# Ejecutar en el servidor
ssh mackewinsson@91.98.198.164
chmod +x /tmp/verify-db-connection.sh
sudo /tmp/verify-db-connection.sh
```

### Verificación Manual:

1. **Verificar que el contenedor está corriendo:**
   ```bash
   ssh mackewinsson@91.98.198.164
   sudo docker ps | grep sqlserver
   ```

2. **Verificar que la base de datos existe:**
   ```bash
   sudo docker exec recepcionactiva-sqlserver /opt/mssql-tools18/bin/sqlcmd \
     -S localhost -U sa -P 'sa2006Strong!' -C \
     -Q "SELECT name FROM sys.databases WHERE name = 'MotosMunozDatos'"
   ```

3. **Verificar que tiene datos:**
   ```bash
   sudo docker exec recepcionactiva-sqlserver /opt/mssql-tools18/bin/sqlcmd \
     -S localhost -U sa -P 'sa2006Strong!' -C -d MotosMunozDatos \
     -Q "SELECT COUNT(*) as TotalEntidades FROM ENT; SELECT COUNT(*) as TotalFacturas FROM CFA"
   ```

4. **Verificar conectividad desde fuera:**
   ```bash
   # Desde tu máquina local
   nc -zv 91.98.198.164 1433
   ```

## ⚠️ Importante

1. **Firewall:** Asegúrate de que el puerto 1433 esté abierto en el firewall del servidor
2. **SQL Server Remote Access:** El contenedor Docker ya expone el puerto 1433, pero verifica que no haya firewall bloqueando
3. **Seguridad:** Considera usar un usuario específico para la aplicación en lugar de `sa` en producción
4. **Backup:** Asegúrate de tener backups regulares de la base de datos

## 🐛 Troubleshooting

### Error: "Login timeout expired"
- Verifica que el contenedor está corriendo: `sudo docker ps | grep sqlserver`
- Verifica que el puerto 1433 está abierto: `sudo netstat -tlnp | grep 1433`
- Espera 60-90 segundos después de iniciar el contenedor para que SQL Server esté listo

### Error: "Cannot connect to server"
- Verifica la IP del servidor: `91.98.198.164`
- Verifica que el firewall permite conexiones en el puerto 1433
- Verifica que SQL Server está configurado para aceptar conexiones remotas

### Error: "Login failed for user 'sa'"
- Verifica la contraseña en `/srv/docker/infra/.env`
- Verifica que la contraseña en Vercel coincide con la del servidor

## 📚 Referencias

- Docker Compose: `/srv/docker/infra/docker-compose.yml`
- Variables de entorno: `/srv/docker/infra/.env`
- Backup de base de datos: `/srv/docker/infra/MotosMunozDatos 15-09-2025`

