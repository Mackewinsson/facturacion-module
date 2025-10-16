# 🚀 Recepción Activa - Sistema de Gestión de Órdenes de Trabajo

Sistema web moderno para la gestión de órdenes de trabajo con funcionalidad de carga de imágenes y integración con base de datos SQL Server.

## 📋 Requisitos Previos

- **Windows Server** (Windows 10/11 o Windows Server 2016+)
- **Node.js 18+** - [Descargar desde nodejs.org](https://nodejs.org) (versión LTS recomendada)
- **SQL Server** con la base de datos existente
- **Docker** (opcional, para desarrollo local)
- **Acceso a red** para el almacenamiento de imágenes

## ⚡ Instalación Rápida

### Paso 1: Instalar Node.js
1. Descargue Node.js desde [nodejs.org](https://nodejs.org)
2. Instale la versión LTS (Long Term Support)
3. Verifique la instalación abriendo CMD y ejecutando:
   ```cmd
   node --version
   npm --version
   ```

### Paso 2: Configurar el Proyecto
1. Clone o descargue este repositorio
2. Navegue a la carpeta del proyecto
3. **Instale las dependencias:**
   ```bash
   npm install
   ```

### Paso 3: Configurar Base de Datos

#### Opción A: Base de Datos Externa (Producción)
1. Copie el archivo de ejemplo y configure las variables de entorno:
   ```bash
   cp env.example .env
   ```
2. Edite el archivo `.env` y configure según su servidor SQL Server:

   **Para instancia por defecto (puerto 1433):**
   ```env
   NODE_ENV=production
   DATABASE_URL="sqlserver://sa:su_password@192.168.1.30:1433;database=VsolDatos;trustServerCertificate=true"
   PORT=3000
   APP_URL=http://192.168.1.30:3000
   ```

   **Para instancia nombrada (ej: SQLEXPRESS):**
   ```env
   NODE_ENV=production
   DATABASE_URL="sqlserver://sa:su_password@192.168.1.30\\SQLEXPRESS:1433;database=VsolDatos;trustServerCertificate=true"
   PORT=3000
   APP_URL=http://192.168.1.30:3000
   ```

#### Opción B: Base de Datos Local con Docker (Desarrollo)
1. Copie el archivo de ejemplo para desarrollo local:
   ```bash
   cp env.local.example .env
   ```
2. Inicie la base de datos local:
   ```bash
   npm run db:start
   ```
3. Restaure la base de datos:
   ```bash
   npm run db:restore
   ```

### Paso 4: Configurar FTP Server

#### Opción A: FTP Server Externo (Producción)
1. Configure los parámetros FTP en el archivo `.env`:
   ```env
   FTP_HOST=192.168.8.10
   FTP_PORT=21
   FTP_USER=usermw
   FTP_PASSWORD=usermw
   FTP_BASE_PATH=/uploads/orders
   FTP_SECURE=false
   FTP_HTTP_BASE_URL=http://192.168.8.10/uploads
   ```

#### Opción B: FTP Server Local con Docker (Desarrollo)
1. Inicie el servidor FTP local:
   ```bash
   npm run ftp:start
   ```
2. Pruebe la conexión:
   ```bash
   npm run ftp:test
   ```

### Paso 5: Generar Cliente de Prisma y Compilar
```bash
# Generar cliente de Prisma
npx prisma generate

# Compilar la aplicación
npm run build
```

### Paso 6: Iniciar la Aplicación

#### Para Producción:
```bash
# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
```

#### Para Desarrollo:
```bash
# Iniciar en modo desarrollo
npm run dev
```

## 🎯 ¡Listo! El sistema estará funcionando

Después de completar la configuración, el sistema estará disponible en:
- **Acceso local:** http://localhost:3000
- **Acceso en red:** http://[IP_DEL_SERVIDOR]:3000

## 🐳 Servicios Docker

### Base de Datos SQL Server
```bash
# Iniciar base de datos
npm run db:start

# Detener base de datos
npm run db:stop

# Restaurar base de datos
npm run db:restore
```

### Servidor FTP
```bash
# Iniciar servidor FTP
npm run ftp:start

# Detener servidor FTP
npm run ftp:stop

# Probar conexión FTP
npm run ftp:test

# Ver logs del servidor FTP
npm run ftp:logs

# Verificar estado del servidor FTP
npm run ftp:status
```

## 📸 Sistema de Subida de Fotos (FTP)

La aplicación utiliza un servidor FTP para la subida de fotos, proporcionando almacenamiento centralizado y mejor escalabilidad.

### Configuración FTP

Las fotos se suben al servidor FTP con la siguiente estructura:
```
/uploads/orders/{numeroOrden}/{nombre-unico}
```

### Características FTP

- ✅ **Creación automática de carpetas**: Las carpetas específicas por orden se crean automáticamente
- ✅ **Nombres únicos**: Nomenclatura basada en UUID previene conflictos
- ✅ **Integración con base de datos**: Referencias de fotos almacenadas en tabla `FOT`
- ✅ **Manejo de errores**: Manejo completo de errores y logging
- ✅ **Gestión de archivos**: Operaciones de subida y eliminación vía FTP
- ✅ **Acceso HTTP**: URLs HTTP configurables para acceso a fotos
- ✅ **Compatibilidad PHP**: Lógica idéntica al sistema PHP original
- ✅ **Nombres en mayúsculas**: Directorios creados en mayúsculas (strtoupper)

### Configuración Local de Desarrollo

Para desarrollo local, el servidor FTP incluye:

- **Host**: `localhost`
- **Port**: `21`
- **Username**: `usermw`
- **Password**: `usermw`
- **HTTP Access**: `http://localhost:8080`

### Estructura de Directorios

```
ftp-data/
├── uploads/
│   └── orders/
│       ├── ORDER001/          # Nombres en mayúsculas
│       │   ├── image1.jpg
│       │   └── image2.png
│       ├── ORDER002/
│       │   └── image1.jpg
│       └── TEST123/
│           └── test-image.jpg
```

## 🔧 Configuración de Almacenamiento de Imágenes

### Opción A: Ruta de Red (Recomendado para producción)
1. **Verificar conectividad de red:**
   ```cmd
   dir \\192.168.1.30\Imagenes
   ```

2. **Configurar en el archivo .env:**
   ```env
   NETWORK_IMAGE_PATH=\\192.168.1.30\Imagenes\
   ```

3. **Configurar en la base de datos:**
   ```sql
   -- Verificar configuración actual
   SELECT * FROM PRM WHERE NOMPRM = 'CarpetaImagenes'
   
   -- Actualizar si es necesario
   UPDATE PRM SET VALPRM = '\\192.168.1.30\Imagenes' WHERE NOMPRM = 'CarpetaImagenes'
   ```

### Opción B: Ruta Local de Windows
1. **Crear directorio local:**
   ```cmd
   mkdir C:\Mw_Imagenes
   ```

2. **Configurar en el archivo .env:**
   ```env
   NETWORK_IMAGE_PATH=C:\Mw_Imagenes\
   ```

3. **Configurar en la base de datos:**
   ```sql
   UPDATE PRM SET VALPRM = 'C:\Mw_Imagenes' WHERE NOMPRM = 'CarpetaImagenes'
   ```

### ⚠️ Importante
- La ruta configurada en `.env` debe coincidir con la configurada en la tabla `PRM`
- Asegúrese de que la aplicación tenga permisos de escritura en la carpeta
- Para rutas de red, verifique que el servicio de red esté funcionando

## 🛠️ Comandos Útiles

### Aplicación
```cmd
# Ver estado de la aplicación
pm2 status

# Ver logs en tiempo real
pm2 logs

# Reiniciar aplicación
pm2 restart all

# Detener aplicación
pm2 stop all

# Iniciar aplicación
pm2 start all

# Monitorear recursos
pm2 monit
```

### Base de Datos
```cmd
# Iniciar base de datos local
npm run db:start

# Detener base de datos local
npm run db:stop

# Restaurar base de datos
npm run db:restore
```

### FTP Server
```cmd
# Iniciar servidor FTP local
npm run ftp:start

# Detener servidor FTP local
npm run ftp:stop

# Probar conexión FTP
npm run ftp:test

# Ver logs del servidor FTP
npm run ftp:logs

# Verificar estado del servidor FTP
npm run ftp:status
```

### Utilidades
```cmd
# Encriptar contraseña
npm run encrypt-password <contraseña>

# Crear usuario
npm run create-user <nombre> <id> [contraseña]

# Configurar FTP para subida de fotos
npm run setup-ftp

# Probar conexión FTP
npm run test-ftp
```

## 🔥 Configuración de Firewall

Para permitir acceso desde otros equipos:
1. Abra **Windows Defender Firewall**
2. Haga clic en **Configuración avanzada**
3. Seleccione **Reglas de entrada** → **Nueva regla**
4. Elija **Puerto** → **TCP** → **Puerto específico: 3000**
5. Permita la conexión

## 🔧 Configuración de SQL Server en Windows

### Verificar configuración de SQL Server:

1. **Habilitar TCP/IP:**
   - Abrir "SQL Server Configuration Manager"
   - Ir a "SQL Server Network Configuration" → "Protocols for [INSTANCE]"
   - Habilitar "TCP/IP"
   - Reiniciar SQL Server

2. **Para instancias nombradas (ej: SQLEXPRESS):**
   - Asegurar que "SQL Server Browser" esté ejecutándose
   - Usar formato: `sqlserver://usuario:password@IP\\INSTANCIA:puerto;database=nombre;trustServerCertificate=true`

3. **Verificar conectividad:**
   ```cmd
   telnet 192.168.1.30 1433
   ```

4. **Probar conexión desde SQL Server Management Studio:**
   - Servidor: `192.168.1.30` o `192.168.1.30\SQLEXPRESS`
   - Autenticación: SQL Server Authentication
   - Usuario: `sa`
   - Contraseña: [su contraseña]

## 🔗 Configuración de Conexión a SQL Server con Prisma

### Formatos de Cadena de Conexión

Prisma utiliza un formato específico para las cadenas de conexión a SQL Server. Aquí están los formatos correctos según diferentes escenarios:

#### 1. **Instancia por Defecto (Puerto 1433)**
```env
DATABASE_URL="sqlserver://usuario:password@192.168.8.11:1433;database=vsoldatos;trustServerCertificate=true"
```

#### 2. **Instancia Nombrada (Recomendado)**
```env
DATABASE_URL="sqlserver://usuario:password@192.168.8.11\\sqlexpress;database=vsoldatos;trustServerCertificate=true"
```

#### 3. **Con Encriptación Habilitada**
```env
DATABASE_URL="sqlserver://usuario:password@192.168.8.11\\sqlexpress;database=vsoldatos;trustServerCertificate=true;encrypt=true"
```

#### 4. **Con Timeout de Conexión**
```env
DATABASE_URL="sqlserver://usuario:password@192.168.8.11\\sqlexpress;database=vsoldatos;trustServerCertificate=true;connectionTimeout=30"
```

#### 5. **Autenticación de Windows (Integrated Security)**
```env
DATABASE_URL="sqlserver://192.168.8.11\\sqlexpress;database=vsoldatos;integratedSecurity=true;trustServerCertificate=true"
```

### Conversión desde DBeaver JDBC

Si tienes una cadena de conexión JDBC funcionando en DBeaver, aquí está la conversión:

**DBeaver JDBC:**
```
jdbc:sqlserver://;serverName=192.168.8.11\sqlexpress;databaseName=vsoldatos
```

**Prisma equivalente:**
```env
DATABASE_URL="sqlserver://usuario:password@192.168.8.11\\sqlexpress;database=vsoldatos;trustServerCertificate=true"
```

### Parámetros Importantes

| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| `trustServerCertificate=true` | Confía en el certificado del servidor | Siempre incluir para desarrollo |
| `encrypt=true` | Habilita encriptación SSL | Opcional, puede causar problemas |
| `connectionTimeout=30` | Timeout de conexión en segundos | Recomendado: 30 |
| `integratedSecurity=true` | Usa autenticación de Windows | Solo para Windows Auth |

### Configuración Recomendada para Producción

```env
# Configuración optimizada para producción
DATABASE_URL="sqlserver://sa:tu_password@192.168.8.11\\sqlexpress;database=vsoldatos;trustServerCertificate=true;connectionTimeout=30"

# Configuración individual (para compatibilidad con otros drivers)
DB_HOST=192.168.8.11
DB_PORT=1433
DB_USER=sa
DB_PASS=tu_password
DB_NAME=vsoldatos
```

### Verificación de Conexión

Para probar la conexión a la base de datos:

```bash
# Generar cliente de Prisma
npx prisma generate

# Probar conexión
npx prisma db pull

# Ver estado de la base de datos
npx prisma db status
```

### Solución de Problemas de Conexión

#### Error: "SQL browser timeout during resolving instance"
- **Causa**: SQL Server Browser no está ejecutándose o no se puede alcanzar
- **Solución**: Usar la instancia sin puerto específico:
  ```env
  DATABASE_URL="sqlserver://usuario:password@192.168.8.11\\sqlexpress;database=vsoldatos;trustServerCertificate=true"
  ```

#### Error: "Can't reach database server"
- **Causa**: Servidor no accesible o puerto bloqueado
- **Solución**: 
  1. Verificar que SQL Server esté ejecutándose
  2. Comprobar conectividad: `ping 192.168.8.11`
  3. Verificar puerto: `telnet 192.168.8.11 1433`

#### Error: "Login failed for user"
- **Causa**: Credenciales incorrectas o usuario deshabilitado
- **Solución**:
  1. Verificar usuario y contraseña
  2. Confirmar que la autenticación SQL Server esté habilitada
  3. Verificar que el usuario tenga permisos en la base de datos

#### Error: "Invalid database string"
- **Causa**: Formato incorrecto de la cadena de conexión
- **Solución**: Usar el formato correcto de Prisma:
  ```env
  DATABASE_URL="sqlserver://usuario:password@servidor\\instancia;database=nombre;trustServerCertificate=true"
  ```

### Configuración de SQL Server Browser

Para instancias nombradas, asegúrate de que SQL Server Browser esté ejecutándose:

1. **Abrir Services (services.msc)**
2. **Buscar "SQL Server Browser"**
3. **Iniciar el servicio si está detenido**
4. **Configurar inicio automático**

### Configuración de Firewall

Para permitir conexiones externas:

1. **Abrir Windows Defender Firewall**
2. **Crear regla de entrada para puerto 1433**
3. **Permitir SQL Server Browser (puerto 1434)**
4. **Configurar excepción para SQL Server**

### Ejemplo de Configuración Completa

```env
# ===========================================
# CONFIGURACIÓN DE BASE DE DATOS
# ===========================================
NODE_ENV=production

# URL de conexión principal (Prisma)
DATABASE_URL="sqlserver://sa:tu_password@192.168.8.11\\sqlexpress;database=vsoldatos;trustServerCertificate=true"

# Configuración individual (para compatibilidad)
DB_HOST=192.168.8.11
DB_PORT=1433
DB_USER=sa
DB_PASS=tu_password
DB_NAME=vsoldatos

# Configuración de aplicación
PORT=3000
APP_URL=http://192.168.8.11:3000
```

## 🔧 Herramientas de Diagnóstico

### Verificación Manual
Para verificar la instalación, ejecute estos comandos:

```bash
# Verificar Node.js y npm
node --version
npm --version

# Verificar dependencias
npm list

# Generar cliente de Prisma
npx prisma generate

# Compilar la aplicación
npm run build
```

## 🚨 Solución de Problemas

### Error de Conexión a Base de Datos
- ✅ Verifique que SQL Server esté ejecutándose
- ✅ Confirme la cadena de conexión en el archivo `.env`
- ✅ Asegúrese de que SQL Server permita conexiones TCP/IP
- ✅ Para instancias nombradas, verifique que SQL Server Browser esté ejecutándose
- ✅ Compruebe que el puerto 1433 esté abierto en el firewall
- ✅ Verifique que el usuario `sa` tenga permisos de acceso

### Error: "Login failed for user 'sa'"
- Verificar que la autenticación SQL Server esté habilitada
- Confirmar que el usuario `sa` esté habilitado
- Verificar la contraseña del usuario `sa`

### Error: "Cannot connect to server"
- Verificar que SQL Server esté ejecutándose
- Comprobar la conectividad de red: `ping 192.168.1.30`
- Verificar que el puerto 1433 esté abierto: `telnet 192.168.1.30 1433`

### Error al Cargar Imágenes
- ✅ Verifique la accesibilidad de la ruta de red
- ✅ Confirme la configuración de la tabla PRM
- ✅ Asegúrese de los permisos del directorio

### Problemas con FTP Server
- ✅ Verificar que Docker esté ejecutándose
- ✅ Comprobar que los puertos 21 y 8080 estén disponibles
- ✅ Verificar logs del servidor FTP: `npm run ftp:logs`
- ✅ Probar conexión FTP: `npm run ftp:test`

### Puerto ya en Uso
```cmd
# Encontrar proceso usando puerto 3000
netstat -ano | findstr :3000

# Terminar el proceso
taskkill /PID [id_del_proceso] /F
```

### Problemas con PM2
```cmd
# Reiniciar aplicación
pm2 restart all

# Ver logs detallados
pm2 logs

# Detener y iniciar desde cero
pm2 stop all
pm2 start all
```

## 📁 Estructura del Proyecto

```
recepcionactiva/
├── src/                    # Código fuente de la aplicación
├── public/                 # Archivos públicos
├── prisma/                 # Configuración de base de datos
├── scripts/                # Scripts de desarrollo
├── ftp-data/               # Datos del servidor FTP local
├── docker-compose.yml      # Configuración de servicios Docker
├── ecosystem.config.js     # Configuración de PM2
├── env.example            # Plantilla de variables de entorno
├── env.local.example      # Plantilla para desarrollo local
└── README.md              # Este archivo
```

## 🔄 Actualizaciones

Para actualizar el sistema:
1. Detenga la aplicación: `pm2 stop all`
2. Actualice el código: `git pull` (si usa Git)
3. Reinstale dependencias: `npm install`
4. Recompile: `npm run build`
5. Reinicie: `pm2 start all`

## 📞 Soporte

Si encuentra problemas:
1. Verifique los logs: `pm2 logs`
2. Confirme la configuración del archivo `.env`
3. Verifique la conectividad de red y base de datos
4. Consulte la sección de solución de problemas arriba

## ✅ Lista de Verificación Final

- [ ] Node.js instalado
- [ ] Conexión a base de datos funcionando
- [ ] Variables de entorno configuradas
- [ ] Aplicación compilada exitosamente
- [ ] PM2 ejecutando la aplicación
- [ ] Firewall configurado
- [ ] Carga de imágenes probada
- [ ] Servidor FTP funcionando (si usa local)
- [ ] Auto-inicio configurado

---

**¡El sistema está listo para usar!** 🎉

Para cualquier consulta o problema, revise esta documentación o contacte al administrador del sistema.