# 🤖 Agents Context - Facturación Module

Este documento proporciona contexto completo del proyecto para asistentes de IA que trabajen en este código.

## 📋 Descripción General

Sistema de facturación español completo construido con Next.js 16, totalmente compatible con las regulaciones de la AEAT (RD 1619/2012). El sistema gestiona facturas emitidas y recibidas, entidades (clientes, proveedores, vendedores), y realiza cálculos automáticos de impuestos españoles (IVA, Recargo de Equivalencia, IRPF).

**Propósito principal:** Gestión completa del ciclo de facturación para empresas españolas, con soporte para múltiples tipos de factura, regímenes especiales de IVA, y cumplimiento normativo.

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** Next.js 16.0.10 (App Router)
- **React:** 19.1.0
- **TypeScript:** 5.x
- **Estilos:** Tailwind CSS 4
- **Formularios:** React Hook Form 7.69.0
- **Estado Global:** Zustand 5.0.8 (con persistencia en localStorage)
- **PDF:** jsPDF 3.0.4

### Backend
- **Runtime:** Node.js 18+
- **ORM:** Prisma 6.16.1
- **Base de Datos:** SQL Server (Microsoft SQL Server)
- **Autenticación:** JWT (jsonwebtoken 9.0.3)
- **Encriptación:** bcryptjs 3.0.2

### Herramientas de Desarrollo
- **Build Tool:** Turbopack (Next.js)
- **Testing:** Jest 29.7.0, React Testing Library
- **Linting:** ESLint 9
- **Type Checking:** TypeScript strict mode

---

## 📁 Estructura del Proyecto

```
facturacion-module/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/login/           # POST /api/auth/login
│   │   │   ├── entities/            # CRUD de entidades
│   │   │   │   ├── route.ts         # GET, POST /api/entities
│   │   │   │   ├── [id]/            # GET, PUT /api/entities/[id]
│   │   │   │   └── nif/[nif]/       # GET /api/entities/nif/[nif]
│   │   │   ├── invoices/            # CRUD de facturas
│   │   │   │   ├── route.ts         # GET, POST /api/invoices
│   │   │   │   └── [id]/            # GET, PUT /api/invoices/[id]
│   │   │   ├── users/               # GET /api/users
│   │   │   └── company/             # GET /api/company
│   │   ├── facturacion/             # Módulo principal de facturación
│   │   │   ├── page.tsx             # Lista de facturas
│   │   │   ├── nueva/               # Crear factura
│   │   │   ├── editar/[id]/         # Editar factura
│   │   │   ├── ver/[id]/            # Ver factura
│   │   │   ├── preview/[id]/        # Vista previa PDF
│   │   │   └── recibidas/           # Facturas recibidas
│   │   ├── entidades/               # Gestión de entidades
│   │   │   ├── page.tsx             # Lista de entidades
│   │   │   ├── nueva/               # Crear entidad
│   │   │   └── editar/[id]/         # Editar entidad
│   │   ├── login/                   # Página de login
│   │   └── page.tsx                 # Home page
│   ├── components/                  # Componentes React
│   │   ├── SpanishInvoiceForm.tsx   # Formulario principal de factura
│   │   ├── EntityModal.tsx         # Modal de edición de entidad
│   │   ├── ClientSearch.tsx        # Búsqueda de clientes
│   │   ├── InvoicePDFView.tsx      # Vista PDF de factura
│   │   ├── Sidebar.tsx             # Navegación lateral
│   │   └── LayoutWithSidebar.tsx   # Layout con sidebar
│   ├── lib/                         # Utilidades y servicios
│   │   ├── repositories/            # Repositorios de datos
│   │   │   ├── entities.ts         # EntitiesRepository
│   │   │   └── invoices.ts          # InvoicesRepository
│   │   ├── mock-data.ts             # Interfaces TypeScript y datos mock
│   │   ├── spanish-tax-calculations.ts  # Cálculos de impuestos
│   │   ├── prisma.ts                # Cliente Prisma
│   │   ├── auth-utils.ts            # Utilidades de autenticación
│   │   ├── jwt.ts                   # JWT helpers
│   │   ├── api-client.ts            # Cliente API con auth
│   │   ├── company-service.ts       # Servicio de empresa
│   │   ├── invoice-db-service.ts    # Servicio de facturas DB
│   │   ├── encryption.ts            # Encriptación de contraseñas
│   │   └── pdf/                     # Generadores de PDF
│   │       ├── invoice-pdf-generator.ts
│   │       └── invoice-form-pdf-generator.ts
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuth.ts               # Hook de autenticación
│   │   └── useCompanyName.ts        # Hook de nombre de empresa
│   ├── store/                       # Zustand stores
│   │   ├── auth.ts                  # Store de autenticación
│   │   └── theme.ts                 # Store de tema
│   └── generated/prisma/            # Cliente Prisma generado
├── prisma/
│   └── schema.prisma                # Schema de Prisma
├── public/                          # Archivos estáticos
└── scripts/                         # Scripts de utilidad
```

---

## 🗄️ Base de Datos

### Motor
- **Tipo:** Microsoft SQL Server
- **ORM:** Prisma
- **Conexión:** Variable de entorno `DATABASE_URL`

### Tablas Principales

#### ENT (Entidades)
- `IDEENT` (PK): ID de entidad
- `NIFENT`: NIF/CIF de la entidad
- `NCOENT`: Nombre comercial / Razón social
- `NOMENT`: Nombre
- `PERENT`: Persona física (boolean)
- `TNIENT`: Tipo de identificador
- `PAOENT`: País de origen
- `EXTENT`: Extranjero (boolean)
- `INTENT`: Operador intracomunitario (boolean)
- `EXPENT`: Importación/Exportación (boolean)
- `CANENT`: Régimen canario (boolean)
- `MONENT`: Moneda
- `FEAENT`: Fecha de alta
- `FEBENT`: Fecha de baja
- `FEMENT`: Fecha de modificación

#### DIR (Direcciones)
- `IDEDIR` (PK): ID de dirección
- `ENTDIR`: FK a ENT
- `DIRDIR`: Dirección completa
- `POBDIR`: Población
- `CPODIR`: Código postal
- `TLFDIR`: Teléfono
- `TL1DIR`: Teléfono móvil
- `EMADIR`: Email
- Relación con `PRO` (Provincias) y `PAI` (Países)

#### CON (Contactos)
- `IDECON` (PK): ID de contacto
- `ENTCON`: FK a ENT
- `TLFCON`: Teléfono
- `TL1CON`: Teléfono móvil
- `EMACON`: Email

#### Relaciones de Entidades (Roles)
- **FCL** (Clientes): `ENTFCL` → `ENT.IDEENT`, `FPAFCL` → `CFP.IDECFP` (forma de pago)
- **FPR** (Proveedores): `ENTFPR` → `ENT.IDEENT`
- **FVE** (Vendedores): `ENTFVE` → `ENT.IDEENT`
- **FOT** (Operarios Taller): `ENTFOT` → `ENT.IDEENT`
- **FFI** (Financieras): `ENTFFI` → `ENT.IDEENT`
- **FTR** (Agencias Transporte): `ENTFTR` → `ENT.IDEENT`
- **FBA** (Bancos): `ENTFBA` → `ENT.IDEENT`
- **FCS** (Aseguradoras): `ENTFCS` → `ENT.IDEENT`
- **FRC** (Rent a Car): `ENTFRC` → `ENT.IDEENT`

**IMPORTANTE:** `FCL` requiere `TCLFCL` (FK a `TCL`). Si no existe un `TCL`, se debe crear uno por defecto con `NOMTCL: 'General'`.

#### CFA (Facturas)
- `IDECFA` (PK): ID de factura
- `NUMCFA`: Número de factura
- `ENTCFA`: FK a ENT (cliente/proveedor)
- `DIRCFA`: FK a DIR (dirección)
- `FECCFA`: Fecha de expedición
- `FCOCFA`: Fecha contable
- `FRECFA`: Factura recibida (boolean: false=emitida, true=recibida)
- `BIPCFA`: Base imponible total
- `CIPCFA`: Cuota IVA total
- `CR1CFA`, `CR2CFA`, `CR3CFA`: Recargos de equivalencia por tipo IVA
- `FPACFA`: FK a `CFP` (forma de pago)
- `FPAFCL`: FK a `CFP` (forma de pago del cliente, desde FCL)

#### LAB (Líneas de Factura)
- `IDELAB` (PK): ID de línea
- `CABLAB`: FK a `CAB` (cabecera de factura)
- `NPELAB`: Descripción
- `SERLAB`: Cantidad
- `NETLAB`: Precio unitario
- `IPTLAB`: Base imponible
- `IVALAB`: Porcentaje IVA
- `REQLAB`: Porcentaje Recargo Equivalencia
- `DT1LAB`, `DT2LAB`: Descuentos (se suman)

#### CAB (Cabeceras de Factura)
- `NUMCAB` (PK): Número de cabecera
- Relacionado con `CFA.NUMCFA`
- Contiene líneas `LAB`

#### CFP (Formas de Pago)
- `IDECFP` (PK): ID de forma de pago
- `NOMCFP`: Nombre de la forma de pago

#### TCL (Tipos de Cliente)
- `IDETCL` (PK): ID de tipo de cliente
- `NOMTCL`: Nombre del tipo

#### USU (Usuarios)
- `ENTUSU` (PK): ID de usuario (FK a ENT)
- `PASUSU`: Contraseña encriptada
- `NIVUSU`: Nivel de acceso
- `ADMUSU`: Nivel de administrador

### Valores por Defecto Importantes
- `DIV` (Divisa): 1 (Euro)
- `PAI` (País): 1 (España)
- `PRO` (Provincia): 30 (Málaga) - puede variar
- `CFP` (Forma de Pago): 1 (por defecto)
- `TCL` (Tipo Cliente): Se crea automáticamente si no existe

---

## 🔌 API Endpoints

### Autenticación

#### POST /api/auth/login
Autentica un usuario y devuelve un JWT.

**Body:**
```json
{
  "userId": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "string",
    "userId": 1001,
    "accessLevel": 1,
    "adminLevel": 0,
    "name": "string",
    "entities": [...]
  }
}
```

**Protección:** Público

---

### Entidades

#### GET /api/entities
Lista entidades con filtros y paginación.

**Query Params:**
- `page` (number, default: 1)
- `limit` (number, default: 1000)
- `tipo` (string): 'ALL' | 'cliente' | 'proveedor' | 'vendedor'
- `nif` (string): Filtro por NIF
- `nombre` (string): Filtro por nombre
- `telefono` (string): Filtro por teléfono

**Response:**
```json
{
  "success": true,
  "entities": [...],
  "total": 100,
  "pages": 10
}
```

**Protección:** Requiere autenticación

#### GET /api/entities/[id]
Obtiene una entidad específica por ID.

**Protección:** Requiere autenticación

#### GET /api/entities/nif/[nif]
Obtiene una entidad por NIF.

**Protección:** Requiere autenticación

#### POST /api/entities
Crea una nueva entidad.

**Body:** Objeto `Entidad` (sin `id`, `createdAt`, `updatedAt`)

**Protección:** Requiere autenticación

**Notas:**
- Crea registro en `ENT`
- Crea registro en `DIR` si se proporciona `domicilio`
- Crea registro en `CON` si se proporciona `telefono` o `email`
- Crea registros en tablas de roles (`FCL`, `FPR`, etc.) según los flags booleanos
- **IMPORTANTE:** Para `FCL`, debe existir o crearse un `TCL` y usarse su `IDETCL` para `TCLFCL`

#### PUT /api/entities/[id]
Actualiza una entidad existente.

**Body:** Objeto parcial `Entidad`

**Protección:** Requiere autenticación

**Notas:**
- Actualiza campos en `ENT`, `DIR`, `CON`
- Gestiona relaciones de roles (crea/elimina registros en `FCL`, `FPR`, etc.)
- Usa `revalidatePath()` para invalidar caché de Next.js

#### DELETE /api/entities/[id]
**Estado:** No implementado (501) - Bloqueado por riesgo de FK constraints

---

### Facturas

#### GET /api/invoices
Lista facturas con filtros y paginación.

**Query Params:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string): Búsqueda en número, NIF o nombre cliente
- `fechaDesde` (string): Filtro fecha desde (ISO)
- `fechaHasta` (string): Filtro fecha hasta (ISO)
- `importeMinimo` (string): Filtro importe mínimo
- `importeMaximo` (string): Filtro importe máximo
- `tipoFactura` (string): 'emitida' | 'recibida'
- `column_factura`, `column_nif`, `column_cliente`, etc.: Filtros por columna

**Response:**
```json
{
  "success": true,
  "invoices": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

**Protección:** Requiere autenticación

#### GET /api/invoices/[id]
Obtiene una factura específica con todas sus líneas.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 12,
    "numero": "R1000005",
    "tipoFactura": "emitida",
    "serie": "R",
    "fechaExpedicion": "...",
    "cliente": {...},
    "lineas": [...],
    "totales": {
      "baseImponibleTotal": 10.05,
      "cuotaIVATotal": 2.11,
      "cuotaRETotal": 0,
      "totalFactura": 12.16
    }
  }
}
```

**Protección:** Requiere autenticación

#### POST /api/invoices
**Estado:** Bloqueado (400) - Requiere `clienteId` y `piezaId` en payload

#### PUT /api/invoices/[id]
**Estado:** Bloqueado (501) - Requiere `clienteId` y `piezaId` en payload

#### DELETE /api/invoices/[id]
**Estado:** No implementado (501) - Bloqueado por riesgo de FK constraints

---

### Otros Endpoints

#### GET /api/users
Lista usuarios (público, para testing)

#### GET /api/company
Obtiene el nombre de la empresa principal

**Query Params:**
- `info` (boolean): Si es true, devuelve información completa

**Protección:** Requiere autenticación

---

## 🔐 Autenticación y Autorización

### Flujo de Autenticación

1. **Login:** Usuario envía `userId` y `password` a `/api/auth/login`
2. **Validación:** Se verifica la contraseña encriptada contra `USU.PASUSU`
3. **JWT:** Se genera un token JWT con información del usuario
4. **Almacenamiento:** Token se guarda en Zustand store (persistido en localStorage)
5. **Requests:** Token se envía en header `Authorization: Bearer <token>`
6. **Validación:** Middleware `requireAuth()` valida el token en cada request protegido

### Estado de Autenticación (Zustand)

**Store:** `src/store/auth.ts`

**Estado:**
- `user`: Usuario actual o `null`
- `token`: JWT token o `null`
- `isAuthenticated`: Boolean
- `_hasHydrated`: Boolean (indica si el store se ha hidratado desde localStorage)

**Métodos:**
- `login(user, token)`: Establece usuario y token
- `logout()`: Limpia usuario y token
- `setHasHydrated(state)`: Marca el estado de hidratación

**Persistencia:** Los datos se persisten en `localStorage` con la clave `auth-storage`

### Hook useAuth

**Ubicación:** `src/hooks/useAuth.ts`

**Propósito:** Maneja la verificación de autenticación con hidratación adecuada.

**Uso:**
```typescript
const { isAuthenticated, token, hasHydrated, isChecking } = useAuth(redirectToLogin)
```

**Comportamiento:**
- Espera a que `_hasHydrated` sea `true` antes de verificar autenticación
- Muestra `isChecking: true` mientras se verifica
- Redirige a `/login` si `redirectToLogin=true` y no hay sesión activa
- Solo redirige después de que la hidratación se complete

**IMPORTANTE:** Todas las páginas protegidas deben usar este hook para evitar redirecciones prematuras al login después de un refresh.

### Protección de Rutas API

**Middleware:** `src/lib/auth-utils.ts`

**Función:** `requireAuth(request: NextRequest)`

**Comportamiento:**
- Extrae token del header `Authorization`
- Valida el token usando `verifyToken()` de `src/lib/jwt.ts`
- Lanza error si el token es inválido, expirado o no existe
- Las rutas API deben llamar `await requireAuth(request)` al inicio

---

## 📊 Modelos de Datos (TypeScript)

### Entidad

```typescript
interface Entidad {
  id: number
  NIF: string
  razonSocial: string
  nombreComercial?: string
  nombre?: string              // Persona física
  apellido1?: string
  apellido2?: string
  sexo?: 'hombre' | 'mujer'
  fechaAlta: string
  fechaBaja?: string
  personaFisica: boolean
  tipoIdentificador: 'NIF/CIF-IVA' | 'NIE' | 'PASAPORTE' | 'OTRO'
  paisOrigen: string
  extranjero: boolean
  operadorIntracomunitario: boolean
  importacionExportacion: boolean
  regimenCanario: boolean
  
  // Relaciones (checkboxes)
  proveedor: boolean
  cliente: boolean
  vendedor: boolean
  operarioTaller: boolean
  aseguradora: boolean
  financiera: boolean
  agenciaTransporte: boolean
  banco: boolean
  rentacar: boolean
  
  monedaEntidad: string
  telefono?: string
  telefonoMovil?: string
  email?: string
  domicilio?: Domicilio
  direcciones?: Direccion[]
  
  // Legacy fields
  tipoEntidad: 'cliente' | 'proveedor' | 'vendedor'
  tipo: 'particular' | 'empresario/profesional'
  nombreORazonSocial: string
  pais: string
  createdAt: string
  updatedAt: string
  
  // Payment info (for clients)
  formaPago?: string  // Desde FCL.CFP.NOMCFP
}
```

### Invoice

```typescript
interface Invoice {
  id: number
  tipoFactura: 'ordinaria' | 'simplificada' | 'rectificativa' | 'emitida' | 'recibida'
  serie?: string
  numero: string
  fechaExpedicion: string
  fechaContable?: string
  lugarEmision?: string
  departamento?: string
  
  emisor: Emisor
  cliente: Cliente
  
  lineas: LineaFactura[]
  totales: Totales
  
  formaPago?: string
  medioPago?: string
  fechaVencimiento?: string
  notas?: string
  estado?: 'borrador' | 'enviada' | 'aceptada' | 'rechazada'
  
  // Campos adicionales
  imputacion?: string
  mantenimientoCliente?: string
  exportacionImportacion?: boolean
  ctaIngreso?: string
  aplicarRetencion?: boolean
  ctaRetencion?: string
  baseRetencion?: number
  porcentajeRetencion?: number
  importeRetencion?: number
  
  // Rectificativa
  esRectificativa?: boolean
  causaRectificacion?: 'error' | 'devolucion' | 'descuento' | 'otro'
  referenciasFacturasRectificadas?: string[]
  
  status: string
  createdAt: string
  updatedAt: string
}
```

### LineaFactura

```typescript
interface LineaFactura {
  id: number
  descripcion: string
  descripcionDetallada?: string
  cantidad: number
  precioUnitario: number
  descuentoPct?: number
  tipoIVA?: 0 | 4 | 10 | 21
  exenta?: boolean
  motivoExencion?: MotivoExencion
  inversionSujetoPasivo?: boolean
  recargoEquivalenciaPct?: number
  baseLinea: number
  cuotaIVA: number
  cuotaRE: number
  totalLinea: number
}
```

---

## 🧮 Cálculos de Impuestos

### Ubicación
`src/lib/spanish-tax-calculations.ts`

### Tasas de IVA
- **0%:** Exento
- **4%:** Superreducido
- **10%:** Reducido
- **21%:** General

### Recargo de Equivalencia
Basado en el tipo de IVA:
- 0% IVA → 0% RE
- 4% IVA → 0.5% RE
- 10% IVA → 1.4% RE
- 21% IVA → 5.2% RE

### Funciones Principales

#### `calculateLineBase(line)`
Calcula la base imponible de una línea:
```
base = (cantidad × precioUnitario) - descuento
```

#### `calculateLineVAT(line)`
Calcula la cuota IVA:
```
cuotaIVA = base × (tipoIVA / 100)
```
Retorna 0 si la línea es exenta o tiene inversión del sujeto pasivo.

#### `calculateLineRE(line)`
Calcula el recargo de equivalencia:
```
cuotaRE = base × (recargoEquivalenciaPct / 100)
```

#### `calculateInvoiceTotals(lineas)`
Agrupa líneas por tipo de IVA y calcula totales:
- `basesPorTipo`: Array de bases agrupadas por tipo IVA
- `baseImponibleTotal`: Suma de todas las bases
- `cuotaIVATotal`: Suma de todas las cuotas IVA
- `cuotaRETotal`: Suma de todos los recargos
- `totalFactura`: Total final

#### `validateInvoiceByType(tipoFactura, invoice)`
Valida que una factura cumpla con los requisitos según su tipo:
- **Ordinaria:** Todos los campos obligatorios
- **Simplificada:** Campos mínimos (para importes < €400)
- **Rectificativa:** Debe tener referencias a facturas rectificadas

---

## 🎨 Componentes Principales

### SpanishInvoiceForm
**Ubicación:** `src/components/SpanishInvoiceForm.tsx`

**Propósito:** Formulario principal para crear/editar facturas.

**Características:**
- Usa React Hook Form para gestión de formulario
- Cálculos automáticos de impuestos en tiempo real
- Soporte para múltiples líneas de factura
- Validación según tipo de factura
- Integración con búsqueda de clientes
- Generación de PDF

**Props:**
- `initialData?: Partial<Invoice>`
- `invoiceId?: number`
- `hideISP?: boolean`
- `hideRecargoEquivalencia?: boolean`
- `allowedVATRates?: number[]`
- `isReceivedInvoice?: boolean`

**Campos Importantes:**
- `baseRetencion`: Por defecto 1.15
- `porcentajeRetencion`: Select con valores predefinidos (0, 7, 15)
- `importeRetencion`: Calculado automáticamente
- `Cta. Ret`: Campo oculto por ahora (no hay contabilidad)

### EntityModal
**Ubicación:** `src/components/EntityModal.tsx`

**Propósito:** Modal para ver/editar entidades.

**Características:**
- Muestra información completa de la entidad
- Permite edición de todos los campos editables
- Gestiona relaciones (checkboxes de roles)
- Muestra forma de pago si la entidad es cliente
- Actualiza UI después de guardar usando `reset()` y `router.refresh()`

**Callback:**
- `onEntityUpdated`: Se llama después de guardar con los datos actualizados

**IMPORTANTE:** 
- Después de guardar, se debe llamar `reset(updatedData, { keepDefaultValues: false })` para actualizar el formulario
- Se debe usar `router.refresh()` para invalidar caché de Next.js
- Los valores booleanos deben convertirse explícitamente al llamar `reset()`

### ClientSearch
**Ubicación:** `src/components/ClientSearch.tsx`

**Propósito:** Componente de búsqueda de clientes.

**Características:**
- Búsqueda por NIF o nombre
- Botón de lupa para buscar
- Integración con modal de entidad
- Muestra forma de pago del cliente seleccionado

### InvoicePDFView
**Ubicación:** `src/components/InvoicePDFView.tsx`

**Propósito:** Vista previa y generación de PDF de facturas.

**Características:**
- Renderiza factura en formato PDF
- Descarga de PDF
- Vista previa en modal

---

## 🔄 Flujos de Trabajo Importantes

### Crear Factura

1. Usuario navega a `/facturacion/nueva`
2. Se carga `SpanishInvoiceForm` con valores por defecto
3. Usuario busca/selecciona cliente usando `ClientSearch`
4. Usuario añade líneas de factura
5. Se calculan automáticamente impuestos y totales
6. Usuario completa campos adicionales (forma de pago, notas, etc.)
7. Al guardar, se valida según tipo de factura
8. Se genera PDF si se solicita

### Editar Entidad

1. Usuario abre modal de entidad desde lista o búsqueda
2. `EntityModal` carga datos de la entidad
3. Usuario edita campos
4. Al guardar:
   - Se llama a `PUT /api/entities/[id]`
   - `EntitiesRepository.update()` actualiza BD
   - Se crean/eliminan registros de relaciones según checkboxes
   - Se llama `onEntityUpdated` con datos frescos
   - Se actualiza UI con `reset()` y `router.refresh()`

### Autenticación y Refresh

1. Usuario hace login → token se guarda en Zustand (localStorage)
2. Usuario navega a página protegida
3. `useAuth` hook:
   - Verifica `_hasHydrated` del store
   - Si no está hidratado, espera
   - Una vez hidratado, verifica `isAuthenticated` y `token`
   - Si no hay sesión y `redirectToLogin=true`, redirige a `/login`
4. Si hay sesión, muestra contenido
5. En refresh de página:
   - Zustand rehidrata desde localStorage
   - `onRehydrateStorage` marca `_hasHydrated=true`
   - `useAuth` espera hidratación antes de verificar
   - Evita redirección prematura al login

---

## ⚠️ Reglas y Restricciones Importantes

### 1. Nunca Modificar Archivos Compartidos Sin Confirmación
Antes de editar utilidades, hooks, modelos o contextos compartidos:
- Identificar dependencias
- Explicar impacto al usuario
- Pedir confirmación

### 2. Aplicar Principios DRY y SOLID
- Extraer lógica repetida a helpers
- Componentes deben tener una sola responsabilidad
- Evitar acoplamiento fuerte

### 3. Gestión de Estado de Autenticación
- **SIEMPRE** usar `useAuth` hook en páginas protegidas
- **NUNCA** verificar `isAuthenticated` directamente sin esperar `hasHydrated`
- Mostrar spinner mientras `isChecking === true`

### 4. Actualización de UI Después de Guardar
Cuando se guarda una entidad:
1. Llamar `reset(updatedData, { keepDefaultValues: false })`
2. Llamar `router.refresh()` para invalidar caché
3. Esperar `onEntityUpdated` callback si existe
4. Convertir valores booleanos explícitamente

### 5. Constraints de Base de Datos
- **FCL requiere TCLFCL:** Siempre verificar/crear `TCL` antes de crear `FCL`
- **No eliminar entidades/facturas:** DELETE endpoints bloqueados por riesgo de FK
- **Valores por defecto:** Usar valores inferidos de BD (DIV=1, PAI=1, PRO=30, CFP=1)

### 6. Validación de Datos
- Truncar strings para evitar errores de SQL Server (longitud máxima según campo)
- Validar NIF usando funciones de `spanish-tax-calculations.ts`
- Validar facturas según tipo usando `validateInvoiceByType()`

### 7. Manejo de Errores
- Capturar errores en try/catch
- Devolver respuestas JSON consistentes con `success: boolean`
- Incluir detalles de error solo en desarrollo
- Manejar errores de autenticación con `createUnauthorizedResponse()`

### 8. Caché de Next.js
- Usar `revalidatePath()` después de actualizar datos
- Usar `router.refresh()` en cliente para invalidar caché
- Agregar timestamps a queries para bypass de caché si es necesario

---

## 🧪 Testing

### Configuración
- **Framework:** Jest 29.7.0
- **Environment:** jsdom
- **Setup:** `src/setupTests.ts`

### Archivos de Test
- `src/lib/repositories/__tests__/invoices.test.ts`
- `src/lib/repositories/__tests__/invoices.unit.test.ts`
- `src/components/__tests__/InvoicePDFView.test.tsx`
- `src/lib/__tests__/encryption.test.ts`
- `src/app/facturacion/__tests__/debounce.test.ts`

### Ejecutar Tests
```bash
npm test
npm run test:watch
```

---

## 🚀 Scripts Disponibles

### Desarrollo
- `npm run dev` - Servidor de desarrollo con Turbopack
- `npm run dev:full` - Desarrollo completo (DB + servidor)

### Base de Datos
- `npm run db:start` - Inicia SQL Server (Docker)
- `npm run db:stop` - Detiene SQL Server
- `npm run db:restore` - Restaura base de datos

### Build
- `npm run build` - Build de producción
- `npm run build:production` - Build con Prisma generate
- `npm run build:clean` - Limpia y construye

### Producción
- `npm start` - Inicia servidor de producción
- `npm run deploy:start` - Inicia con PM2
- `npm run deploy:restart` - Reinicia con PM2

### Utilidades
- `npm run encrypt-password` - Encripta contraseña
- `npm run validate-env` - Valida variables de entorno
- `npm run create-user` - Crea usuario en BD

---

## 📝 Convenciones de Código

### Nombres de Archivos
- Componentes: PascalCase (ej: `SpanishInvoiceForm.tsx`)
- Utilidades: camelCase (ej: `auth-utils.ts`)
- Repositorios: camelCase con sufijo `Repository` (ej: `entities.ts` → `EntitiesRepository`)

### Nombres de Variables
- TypeScript: camelCase
- Interfaces: PascalCase
- Constantes: UPPER_SNAKE_CASE o camelCase según contexto

### Estructura de Componentes
1. Imports (React, Next.js, librerías externas, componentes locales, utilidades)
2. Interfaces/Types
3. Constantes
4. Componente principal
5. Exports

### Manejo de Formularios
- Usar React Hook Form
- Validación con `formState.errors`
- Valores por defecto con `getDefaultValues()`
- Reset con `reset(data, { keepDefaultValues: false })`

### Manejo de API
- Usar `fetchWithAuth()` de `api-client.ts` para requests autenticados
- Manejar errores con try/catch
- Devolver respuestas JSON consistentes

---

## 🔍 Búsqueda y Debugging

### Logs
- Los logs se guardan en `logs/` (combined.log, err.log, out.log)
- En desarrollo, usar `console.log` con moderación
- En producción, usar sistema de logging estructurado

### Debugging de Autenticación
1. Verificar `localStorage.getItem('auth-storage')`
2. Verificar `_hasHydrated` en Zustand store
3. Verificar token en header `Authorization`
4. Verificar expiración del token

### Debugging de Base de Datos
1. Verificar conexión con `npm run test-db-connection`
2. Verificar schema de Prisma
3. Verificar constraints de FK
4. Verificar valores por defecto

### Debugging de UI Updates
1. Verificar que `reset()` se llama con datos frescos
2. Verificar que `router.refresh()` se llama
3. Verificar que `onEntityUpdated` se espera correctamente
4. Verificar conversión de valores booleanos

---

## 📚 Referencias Externas

### Documentación
- **Next.js 16:** https://nextjs.org/docs
- **Prisma:** https://www.prisma.io/docs
- **React Hook Form:** https://react-hook-form.com
- **Zustand:** https://zustand-demo.pmnd.rs
- **AEAT RD 1619/2012:** Reglamento de facturación español

### Archivos de Documentación del Proyecto
- `README.md` - Documentación general
- `docs/PROJECT_CONTEXT.md` - Contexto del proyecto
- `docs/DEPLOYMENT-GUIDE.md` - Guía de despliegue
- `DEPLOY-READINESS-CHECKLIST.md` - Checklist de despliegue

---

## 🎯 Estado Actual del Proyecto

### Funcionalidades Implementadas
✅ Sistema de autenticación JWT
✅ CRUD de entidades (clientes, proveedores, vendedores)
✅ Listado y visualización de facturas
✅ Formulario completo de facturación
✅ Cálculos automáticos de impuestos españoles
✅ Generación de PDF
✅ Búsqueda y filtrado avanzado
✅ Gestión de relaciones de entidades
✅ Persistencia de sesión en localStorage

### Funcionalidades Pendientes/Bloqueadas
❌ Crear/Editar facturas desde API (requiere `clienteId` y `piezaId`)
❌ Eliminar entidades/facturas (bloqueado por FK constraints)
❌ Integración contable completa (campos de cuenta contable ocultos)

### Issues Conocidos
- Test files tienen errores de TypeScript (no críticos)
- Algunos campos de factura requieren mapeo adicional desde BD

---

## 💡 Tips para IA

1. **Siempre verificar autenticación** antes de modificar código que afecte rutas protegidas
2. **Usar tipos TypeScript** de `mock-data.ts` en lugar de crear nuevos
3. **Seguir el patrón de repositorios** para acceso a datos
4. **Validar datos** antes de guardar en BD (especialmente strings y FKs)
5. **Probar cambios** en desarrollo antes de sugerir
6. **Documentar cambios** importantes en commits
7. **Mantener compatibilidad** con estructura de BD existente
8. **Respetar constraints** de FK y valores por defecto

---

**Última actualización:** 2025-01-XX
**Versión del proyecto:** 0.1.0

