# 🚀 Guía de Despliegue en Vercel

## ✅ Estado: LISTO PARA DESPLEGAR

El proyecto está **completamente listo** para desplegar en Vercel. Todos los errores de tipos han sido corregidos y el build pasa exitosamente.

## ✅ Checklist Completado

- [x] Configuración de base de datos verificada
- [x] Conexión a SQL Server funcionando
- [x] Variables de entorno documentadas
- [x] `vercel.json` creado
- [x] Rutas API actualizadas para Next.js 15 (params como Promise)
- [x] Autenticación JWT implementada
- [x] Errores de tipos TypeScript corregidos
- [x] Build exitoso: `npm run build:production`

## 🔧 Configuración en Vercel

### 1. Variables de Entorno

En **Vercel Dashboard → Settings → Environment Variables**, agregar:

```
DATABASE_URL=sqlserver://sa:sa2006Strong!@91.98.198.164:1433;database=MotosMunozDatos;trustServerCertificate=true
JWT_SECRET=GENERA_UNA_CLAVE_SECRETA_ALEATORIA_DE_AL_MENOS_32_CARACTERES
NODE_ENV=production
```

**Para generar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Build Settings

Vercel detectará automáticamente Next.js, pero puedes verificar:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build:production` (o `npm run build`)
- **Output Directory:** `.next` (por defecto)
- **Install Command:** `npm install`

### 3. Deploy

1. **Conecta tu repositorio a Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub/GitLab/Bitbucket

2. **Configura el proyecto:**
   - Framework: Next.js (detectado automáticamente)
   - Root Directory: `.` (raíz del proyecto)
   - Build Command: `npm run build:production`
   - Output Directory: `.next`

3. **Agrega las variables de entorno:**
   - Ve a Settings → Environment Variables
   - Agrega `DATABASE_URL`, `JWT_SECRET`, y `NODE_ENV`

4. **Haz clic en "Deploy"**

## 📊 Verificación Post-Deploy

Después del despliegue, verifica:

1. **La aplicación carga correctamente**
2. **El login funciona** (prueba con un usuario de la base de datos)
3. **Las facturas se cargan** desde la base de datos
4. **Las entidades se cargan** correctamente

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Verifica que `DATABASE_URL` está correctamente configurada
- Verifica que el servidor SQL Server está accesible desde internet
- Verifica que el puerto 1433 está abierto en el firewall

### Error: "JWT verification failed"
- Verifica que `JWT_SECRET` está configurado
- Asegúrate de usar el mismo `JWT_SECRET` en desarrollo y producción

### Error: "Build failed"
- Verifica que todas las dependencias están en `package.json`
- Revisa los logs de build en Vercel para más detalles

## 📝 Notas Importantes

- **Base de datos:** Asegúrate de que el servidor SQL Server en `91.98.198.164` esté siempre accesible
- **Seguridad:** Considera usar un usuario específico para la aplicación en lugar de `sa`
- **Backups:** Configura backups regulares de la base de datos
- **Monitoreo:** Configura alertas en Vercel para errores y tiempo de respuesta

## 🔗 Referencias

- [VERCEL-DB-CONFIG.md](./VERCEL-DB-CONFIG.md) - Configuración de base de datos
- [TEST-RESULTS.md](./TEST-RESULTS.md) - Resultados de pruebas de conexión
- [docs/DEPLOYMENT-GUIDE.md](./docs/DEPLOYMENT-GUIDE.md) - Guía completa de despliegue

## ✅ Build Local Verificado

```bash
npm run build:production
# ✓ Compiled successfully
```

El proyecto está listo para producción! 🚀
