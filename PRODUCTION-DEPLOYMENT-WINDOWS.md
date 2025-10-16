# 🚀 Guía de Despliegue en Producción - Windows

## ⚠️ **IMPORTANTE: Pasos Críticos para Windows**

### 1. **Prisma Generate es OBLIGATORIO**
```bash
# En Windows (PowerShell/CMD):
npx prisma generate

# O usando el script automatizado:
npm run build:production:windows
```

### 2. **Configuración de Base de Datos**
Asegúrate de que tu archivo `.env.production` tenga:
```env
# Configuración individual de base de datos (REQUERIDO para el driver adapter)
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASS=tu_password_aqui
DB_NAME=MotosMunozDatos

# Prisma DATABASE_URL
DATABASE_URL="sqlserver://sa:tu_password_aqui@localhost:1433;database=MotosMunozDatos;trustServerCertificate=true;encrypt=true"
```

## 📋 **Pasos de Despliegue**

### **Opción 1: Script Automatizado (Recomendado)**
```bash
# 1. Clonar el repositorio
git clone <tu-repo>
cd recepcionactiva

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
copy env.production.example .env.production
# Editar .env.production con tus datos

# 4. Validar configuración
npm run validate-env

# 5. Build completo con Prisma (JavaScript - multiplataforma)
npm run build:production

# 6. Iniciar aplicación (JavaScript - multiplataforma)
npm run start
```

### **Opción 2: Pasos Manuales**
```bash
# 1. Instalar dependencias
npm install

# 2. Validar variables de entorno
npm run validate-env

# 3. Generar cliente Prisma (CRÍTICO)
npx prisma generate

# 4. Build de la aplicación
npm run build

# 5. Iniciar aplicación
npm run start
```

## 🔧 **Configuración de SQL Server en Windows**

### **Requisitos:**
- SQL Server 2019 o superior
- SQL Server Management Studio (opcional)
- Node.js 18+ y npm

### **Configuración de SQL Server:**
1. **Habilitar TCP/IP:**
   - Abrir SQL Server Configuration Manager
   - SQL Server Network Configuration → Protocols for [INSTANCE]
   - Habilitar TCP/IP
   - Reiniciar SQL Server

2. **Configurar puerto:**
   - TCP/IP Properties → IP Addresses
   - IPAll → TCP Port: 1433
   - Reiniciar SQL Server

3. **Autenticación:**
   - SQL Server Management Studio
   - Security → Logins
   - Crear usuario 'sa' con password fuerte

## 🐛 **Solución de Problemas Comunes**

### **Error: "@prisma/client did not initialize yet"**
```bash
# Solución:
npx prisma generate
```

### **Error: "Failed to connect to database"**
1. Verificar que SQL Server esté ejecutándose
2. Verificar configuración en `.env.production`
3. Probar conexión:
   ```bash
   telnet localhost 1433
   ```

### **Error: "Module not found"**
```bash
# Limpiar y reinstalar:
npm run clean:windows
npm install
npx prisma generate
npm run build
```

## 📊 **Monitoreo con PM2 (Opcional)**

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar con PM2
npm run deploy:start

# Ver estado
npm run deploy:status

# Ver logs
npm run deploy:logs
```

## 🔒 **Configuración de Seguridad**

### **Variables de Entorno Críticas:**
```env
# JWT Secret (generar uno fuerte)
JWT_SECRET=tu-jwt-secret-super-seguro

# Session Secret
SESSION_SECRET=tu-session-secret

# Base de datos
DB_PASS=password-super-seguro
```

### **Firewall:**
- Abrir puerto 3000 (aplicación)
- Abrir puerto 1433 (SQL Server) solo si es necesario

## 📝 **Checklist de Despliegue**

- [ ] SQL Server instalado y configurado
- [ ] Node.js 18+ instalado
- [ ] Repositorio clonado
- [ ] Variables de entorno configuradas
- [ ] `npx prisma generate` ejecutado
- [ ] `npm run build` exitoso
- [ ] Aplicación iniciada correctamente
- [ ] Dashboard muestra "MOTOS MUÑOZ S.C"
- [ ] Conexión a base de datos funcionando

## 🆘 **Comandos de Emergencia**

```bash
# Reset completo
npm run clean:windows
npm install
npm run build:production

# Verificar estado
npm run deploy:status
npm run deploy:logs

# Reiniciar aplicación
npm run deploy:restart
```

## 📞 **Soporte**

Si encuentras problemas:
1. Verificar logs: `npm run deploy:logs`
2. Verificar estado: `npm run deploy:status`
3. Revisar configuración de base de datos
4. Ejecutar `npx prisma generate` nuevamente
