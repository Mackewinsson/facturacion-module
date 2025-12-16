# Contexto del Proyecto - Facturación Module

## Información General

**Proyecto:** Sistema de facturación para gestión de entidades (clientes/proveedores) y facturas  
**Stack:** Next.js 14+ (App Router), React, TypeScript, Prisma ORM, SQL Server  
**Base de Datos:** SQL Server (MotosMunozDatos)  
**Estado:** Integración completa con base de datos real (migrado de mocks)

## Estructura de Base de Datos

### Tablas Principales

#### ENT (Entidades)
Tabla principal para clientes, proveedores, vendedores y otras entidades.

**Campos clave:**
- `IDEENT` (PK, Int, autoincrement) - ID único de entidad
- `NIFENT` (String, unique) - NIF/CIF de la entidad
- `NCOENT` (String) - Razón social / Nombre comercial principal
- `NOMENT` (String?) - Nombre comercial alternativo
- `PERENT` (Boolean) - Persona física (true) o jurídica (false)
- `TNIENT` (String, default "02") - Tipo identificador (NIF/NIE/pasaporte)
- `FEAENT` (DateTime) - Fecha de alta
- `FEBENT` (DateTime?) - Fecha de baja
- `PAOENT` (Int?) - País de origen (FK a PAI.IDEPAI)
- `MONENT` (Int?) - Moneda (FK a DIV.IDEDIV, 1=Euro, 2=Peseta)
- `EXTENT` (Int?) - Extranjero (0=No, 1=Sí)
- `INTENT` (Boolean?) - Operador intracomunitario
- `EXPENT` (Boolean?) - Importación/Exportación
- `CANENT` (Boolean?) - Régimen canario

**Relaciones de roles (tablas separadas):**
- `FCL` (Cliente) - `ENT.IDEENT` → `FCL.ENTFCL`
- `FPR` (Proveedor) - `ENT.IDEENT` → `FPR.ENTFPR`
- `FVE` (Vendedor) - `ENT.IDEENT` → `FVE.ENTFVE`
- `FOT` (Operario Taller) - `ENT.IDEENT` → `FOT.ENTFOT`
- `FCS` (Aseguradora) - `ENT.IDEENT` → `FCS.ENTFCS`
- `FFI` (Financiera) - `ENT.IDEENT` → `FFI.ENTFFI`
- `FTR` (Agencia Transporte) - `ENT.IDEENT` → `FTR.ENTFTR`
- `FBA` (Banco) - `ENT.IDEENT` → `FBA.ENTFBA`
- `FRC` (Rentacar) - `ENT.IDEENT` → `FRC.ENTFRC`

**Relaciones:**
- `DIR_DIR_ENTDIRToENT` - Direcciones (uno a muchos)
- `CON` - Contactos (uno a muchos)
- `DIV` - Moneda (relación implícita por MONENT)
- `PAI` - País (relación implícita por PAOENT)

#### DIR (Direcciones)
Direcciones asociadas a entidades.

**Campos clave:**
- `IDEDIR` (PK, Int, autoincrement)
- `ENTDIR` (Int, FK a ENT.IDEENT)
- `NOMDIR` (String) - Nombre/centro de la dirección (ej: "PRINCIPAL")
- `DIRDIR` (String) - Calle/dirección completa
- `POBDIR` (String) - Población/municipio
- `CPODIR` (String) - Código postal
- `PRODIR` (Int, FK a PRO.IDEPRO) - Provincia
- `PAIDIR` (Int, FK a PAI.IDEPAI) - País
- `TLFDIR` (String?) - Teléfono fijo
- `TL1DIR` (String?) - Teléfono móvil
- `EMADIR` (String?) - Email

#### CON (Contactos)
Contactos personales asociados a entidades.

**Campos clave:**
- `IDECON` (PK, Int, autoincrement)
- `ENTCON` (Int, FK a ENT.IDEENT)
- `DIRCON` (Int?, FK a DIR.IDEDIR) - Dirección asociada
- `NOMCON` (String) - Nombre del contacto
- `TLFCON` (String?) - Teléfono
- `TL1CON` (String?) - Teléfono móvil
- `EMACON` (String?) - Email

#### CFA (Facturas)
Tabla principal de facturas (emitidas y recibidas).

**Campos clave:**
- `IDECFA` (PK, Int, autoincrement)
- `NUMCFA` (String) - Número de factura (ej: "R1000005")
- `FRECFA` (Boolean, default false) - **FALSE = emitida, TRUE = recibida**
- `ENTCFA` (Int, FK a ENT.IDEENT) - Cliente/proveedor
- `DIRCFA` (Int?, FK a DIR.IDEDIR) - Dirección de facturación
- `ALMCFA` (Int?, FK a ALM.IDEALM) - Almacén (para lugar de emisión)
- `DEPCFA` (Int, FK a DEP.IDEDEP) - Departamento
- `FECCFA` (DateTime) - Fecha contable
- `FEMCFA` (DateTime) - Fecha de expedición
- `FPACFA` (Int, FK a CFP.IDECFP) - Forma de pago
- `MPACFA` (Int?) - Medio de pago
- `TOTCFA` (Money) - Total factura

**Bases imponibles:**
- `BI1CFA` (Money) - Base imponible tipo 1
- `BI2CFA` (Money) - Base imponible tipo 2
- `BI3CFA` (Money) - Base imponible tipo 3
- `BIPCFA` (Money) - Base imponible productos

**Cuotas IVA:**
- `CI1CFA` (Money?) - Cuota IVA tipo 1
- `CI2CFA` (Money?) - Cuota IVA tipo 2
- `CI3CFA` (Money?) - Cuota IVA tipo 3
- `CIPCFA` (Money?) - Cuota IVA productos

**Cuotas RE (Recargo Equivalencia):**
- `CR1CFA` (Money?) - Cuota RE tipo 1
- `CR2CFA` (Money?) - Cuota RE tipo 2
- `CR3CFA` (Money?) - Cuota RE tipo 3
- `CRPCFA` (Money?) - Cuota RE productos

**Reglas importantes:**
- **Tipo factura:** `FRECFA = false` → emitida, `FRECFA = true` → recibida
- **Rectificativa:** Si `TOTCFA < 0` → es rectificativa
- **Serie:** Primer carácter de `NUMCFA` (ej: "R" de "R1000005")
- **Número:** `NUMCFA` completo

#### CAB (Albaranes/Cabeceras)
Cabeceras de albaranes que se relacionan con facturas.

**Campos clave:**
- `NUMCAB` (PK, String) - Número de albarán
- `FACCAB` (String?) - Número de factura asociada (FK a CFA.NUMCFA)
- `ENTCAB` (Int, FK a ENT.IDEENT) - Entidad
- `DIRCAB` (Int?, FK a DIR.IDEDIR) - Dirección
- `FECCAB` (DateTime) - Fecha

**Relación con facturas:**
- `CAB.FACCAB = CFA.NUMCFA` → albarán asociado a factura

#### LAB (Líneas de Albarán)
Líneas de albaranes que se muestran como líneas de factura.

**Campos clave:**
- `IDELAB` (PK, Int, autoincrement)
- `ALBLAB` (String, FK a CAB.NUMCAB) - Albarán
- `PZALAB` (Int?, FK a Piezas.IDPieza) - Pieza/producto
- `NPELAB` (String?) - Descripción de la línea
- `SERLAB` (Real) - Cantidad
- `NETLAB` (Money) - Precio unitario
- `IPTLAB` (Money) - Importe base (después de descuentos)
- `DT1LAB` (Real) - Descuento 1 (%)
- `DT2LAB` (Real) - Descuento 2 (%)
- `IVALAB` (Real) - Porcentaje IVA
- `REQLAB` (Real) - Porcentaje Recargo Equivalencia

**Relación con facturas:**
- `CAB.FACCAB = CFA.NUMCFA` → `LAB.ALBLAB = CAB.NUMCAB` → líneas de la factura

#### CRT (Créditos/Vencimientos)
Vencimientos de facturas a crédito.

**Campos clave:**
- `IDECRT` (PK, Int, autoincrement)
- `DOCCRT` (String) - Número de documento/factura (FK a CFA.NUMCFA)
- `FVTCRT` (DateTime?) - Fecha de vencimiento
- `ENTCRT` (Int, FK a ENT.IDEENT) - Entidad

**Regla:** Solo existe si la forma de pago es crédito

#### PIEZAS (Productos/Artículos)
Catálogo de productos/artículos.

**Campos clave:**
- `IDPieza` (PK)
- `DenominacionPieza` (String) - Descripción/nombre
- `PVPPieza` (Money) - Precio de venta al público
- `IvaPieza` (Int?, FK a IVA.IDEIVA) - Tipo de IVA

#### Catálogos

**PAI (Países):**
- `IDEPAI` (PK) - ID del país
- `NOMPAI` (String) - Nombre del país
- Default: `IDEPAI = 1` → ESPAÑA

**PRO (Provincias):**
- `IDEPRO` (PK) - ID de provincia
- `NOMPRO` (String) - Nombre de provincia
- Default: `IDEPRO = 30` → Málaga (usado como fallback)

**DIV (Monedas):**
- `IDEDIV` (PK) - ID de moneda
- `NOMDIV` (String) - Nombre de moneda
- `IDEDIV = 1` → Euro, `IDEDIV = 2` → Peseta

**CFP (Formas de Pago):**
- `IDECFP` (PK) - ID de forma de pago
- `NOMCFP` (String) - Nombre de forma de pago
- Default: `IDECFP = 1` → Contado

## Mapeo Frontend ↔ Backend

### Entidades

| Frontend | Backend (DB) | Notas |
|----------|--------------|-------|
| `id` | `ENT.IDEENT` | |
| `NIF` | `ENT.NIFENT` | |
| `razonSocial` | `ENT.NCOENT` | |
| `nombreComercial` | `ENT.NOMENT` | |
| `fechaAlta` | `ENT.FEAENT` | Convertido a ISO string |
| `fechaBaja` | `ENT.FEBENT` | Convertido a ISO string (nullable) |
| `personaFisica` | `ENT.PERENT` | Boolean |
| `tipoIdentificador` | `ENT.TNIENT` | String (ej: "02") |
| `paisOrigen` | `ENT.PAOENT` | Int (FK a PAI) |
| `extranjero` | `ENT.EXTENT` | 0 o 1 |
| `operadorIntracomunitario` | `ENT.INTENT` | Boolean |
| `importacionExportacion` | `ENT.EXPENT` | Boolean |
| `regimenCanario` | `ENT.CANENT` | Boolean |
| `cliente` | Existe registro en `FCL` | Boolean |
| `proveedor` | Existe registro en `FPR` | Boolean |
| `vendedor` | Existe registro en `FVE` | Boolean |
| `operarioTaller` | Existe registro en `FOT` | Boolean |
| `aseguradora` | Existe registro en `FCS` | Boolean |
| `financiera` | Existe registro en `FFI` | Boolean |
| `agenciaTransporte` | Existe registro en `FTR` | Boolean |
| `banco` | Existe registro en `FBA` | Boolean |
| `rentacar` | Existe registro en `FRC` | Boolean |
| `monedaEntidad` | `ENT.MONENT` | Int (FK a DIV), mapeado a string |
| `telefono` | `CON.TLFCON` | Primer contacto |
| `email` | `CON.EMACON` | Primer contacto |
| `direcciones[].centro` | `DIR.NOMDIR` | |
| `direcciones[].direccion` | `DIR.DIRDIR` | |
| `direcciones[].telefono` | `DIR.TLFDIR` | |
| `direcciones[].telefonoMovil` | `DIR.TL1DIR` | |
| `direcciones[].email` | `DIR.EMADIR` | |

### Facturas

| Frontend | Backend (DB) | Notas |
|----------|--------------|-------|
| `id` | `CFA.IDECFA` | |
| `numero` | `CFA.NUMCFA` | |
| `tipoFactura` | `CFA.FRECFA` | `false` = emitida, `true` = recibida |
| `serie` | Primer carácter de `CFA.NUMCFA` | |
| `fechaExpedicion` | `CFA.FEMCFA` | |
| `fechaContable` | `CFA.FECCFA` | |
| `lugarEmision` | `ALM.DIR.POBDIR` | Vía `CFA.ALMCFA → ALM.DIRALM → DIR` |
| `departamento` | `DEP.NOMDEP` | Vía `CFA.DEPCFA → DEP` |
| `cliente.nombreORazonSocial` | `ENT.NCOENT` | Vía `CFA.ENTCFA → ENT` |
| `cliente.NIF` | `ENT.NIFENT` | |
| `cliente.domicilio` | `DIR.*` | Vía `CFA.DIRCFA → DIR` |
| `lineas[].descripcion` | `PIEZAS.DenominacionPieza` o `LAB.NPELAB` | |
| `lineas[].cantidad` | `LAB.SERLAB` | |
| `lineas[].precioUnitario` | `LAB.NETLAB` | |
| `lineas[].descuentoPct` | `LAB.DT1LAB + LAB.DT2LAB` | Suma de ambos |
| `lineas[].tipoIVA` | `LAB.IVALAB` | Porcentaje |
| `lineas[].recargoEquivalenciaPct` | `LAB.REQLAB` | Porcentaje |
| `totales.baseImponibleTotal` | `BI1CFA + BI2CFA + BI3CFA + BIPCFA` | |
| `totales.cuotaIVATotal` | `CI1CFA + CI2CFA + CI3CFA + CIPCFA` | |
| `totales.cuotaRETotal` | `CR1CFA + CR2CFA + CR3CFA + CRPCFA` | |
| `totales.totalFactura` | `CFA.TOTCFA` | |
| `formaPago` | `CFA.FPACFA` | Int (FK a CFP) |
| `medioPago` | `CFA.MPACFA` | Int |
| `fechaVencimiento` | `CRT.FVTCRT` | Solo si forma pago es crédito |
| `esRectificativa` | `TOTCFA < 0` | Calculado |

## Endpoints API

### Entidades

#### GET /api/entities
Lista entidades con filtros y paginación.

**Query params:**
- `page` (number, default: 1)
- `limit` (number, default: 1000)
- `tipo` (string) - Filtro por tipo: 'ALL', 'cliente', 'proveedor', 'vendedor'
- `nif` (string) - Filtro por NIF
- `nombre` (string) - Filtro por nombre/razón social
- `telefono` (string) - Filtro por teléfono

**Response:**
```json
{
  "success": true,
  "entities": [...],
  "total": 100,
  "pages": 10
}
```

#### GET /api/entities/[id]
Obtiene una entidad específica por ID.

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

#### POST /api/entities
Crea una nueva entidad.

**Body:** Objeto `Entidad` sin `id`, `createdAt`, `updatedAt`

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Notas:**
- Crea registro en `ENT`
- Crea registro en `DIR` si se proporciona `domicilio`
- Crea registro en `CON` si se proporciona `telefono` o `email`
- Crea registros en tablas de roles (`FCL`, `FPR`, etc.) según los flags

#### PUT /api/entities/[id]
Actualiza una entidad existente.

**Body:** Objeto parcial `Entidad`

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

#### DELETE /api/entities/[id]
**Estado:** Bloqueado (501) - No implementado por riesgo de FK constraints

### Facturas

#### GET /api/invoices
Lista facturas con filtros y paginación.

**Query params:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string) - Búsqueda en número, NIF o nombre cliente
- `fechaDesde` (string) - Filtro fecha desde (ISO)
- `fechaHasta` (string) - Filtro fecha hasta (ISO)
- `importeMinimo` (string) - Filtro importe mínimo
- `importeMaximo` (string) - Filtro importe máximo
- `tipoFactura` (string) - 'emitida' o 'recibida'
- `column_factura` (string) - Filtro por número de factura
- `column_nif` (string) - Filtro por NIF cliente
- `column_cliente` (string) - Filtro por nombre cliente

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
    "fechaContable": "...",
    "cliente": { ... },
    "lineas": [...],
    "totales": {
      "baseImponibleTotal": 10.05,
      "cuotaIVATotal": 2.11,
      "cuotaRETotal": 0,
      "totalFactura": 12.16
    },
    ...
  }
}
```

#### POST /api/invoices
**Estado:** Bloqueado (400) - Requiere `clienteId` y `piezaId` en payload

#### PUT /api/invoices/[id]
**Estado:** Bloqueado (501) - Requiere `clienteId` y `piezaId` en payload

#### DELETE /api/invoices/[id]
**Estado:** Bloqueado (501) - No implementado por riesgo de FK constraints

## Repositorios

### EntitiesRepository
Ubicación: `src/lib/repositories/entities.ts`

**Métodos:**
- `list(params)` - Lista entidades con filtros
- `findById(id)` - Obtiene entidad por ID
- `create(payload)` - Crea nueva entidad
- `update(id, payload)` - Actualiza entidad existente

**Características:**
- Consultas separadas para `FVE`, `FCS`, `FRC` (no tienen relación directa en Prisma)
- Mapeo de roles basado en existencia de registros en tablas de roles
- Truncamiento de strings para evitar errores de SQL Server
- Valores por defecto inferidos de la BD (DIV=1, PAI=1, PRO=30, CFP=1)

### InvoicesRepository
Ubicación: `src/lib/repositories/invoices.ts`

**Métodos:**
- `list(params)` - Lista facturas con filtros
- `findById(id)` - Obtiene factura completa con líneas

**Características:**
- Filtro por tipo usando `FRECFA` (false=emitida, true=recibida)
- Obtención de líneas vía `CAB → LAB` relacionadas con `CFA.NUMCFA`
- Cálculo de totales incluyendo `BIPCFA`, `CIPCFA`, `CR1CFA`, `CR2CFA`, `CR3CFA`
- Descuentos en líneas: `DT1LAB + DT2LAB`
- Obtención de vencimientos desde `CRT` usando `FVTCRT`

## Reglas de Negocio Importantes

### Entidades

1. **Roles:** Se determinan por existencia de registros en tablas de roles, no por campos booleanos
2. **Moneda:** Se guarda como ID numérico (`MONENT`), no como string
3. **País:** Se guarda como ID numérico (`PAOENT`), no como string
4. **Contacto principal:** Se toma el primer registro de `CON` ordenado por `IDECON`
5. **Dirección principal:** Primera dirección en `DIR_DIR_ENTDIRToENT`
6. **Valores por defecto al crear:**
   - `DIV.IDEDIV = 1` (Euro)
   - `PAI.IDEPAI = 1` (España)
   - `PRO.IDEPRO = 30` (Málaga) si no se especifica provincia
   - `CFP.IDECFP = 1` (Contado) para formas de pago

### Facturas

1. **Tipo de factura:**
   - `FRECFA = false` → Emitida
   - `FRECFA = true` → Recibida
   - `TOTCFA < 0` → Rectificativa (si es emitida)

2. **Serie y número:**
   - Serie: Primer carácter de `NUMCFA` (ej: "R", "T")
   - Número: `NUMCFA` completo (ej: "R1000005")

3. **Líneas de factura:**
   - Se obtienen desde `LAB` vía `CAB.FACCAB = CFA.NUMCFA`
   - Relación: `CFA.NUMCFA` → `CAB.FACCAB` → `LAB.ALBLAB = CAB.NUMCAB`

4. **Cálculo de totales:**
   - Base imponible: `BI1CFA + BI2CFA + BI3CFA + BIPCFA`
   - Cuota IVA: `CI1CFA + CI2CFA + CI3CFA + CIPCFA`
   - Cuota RE: `CR1CFA + CR2CFA + CR3CFA + CRPCFA`
   - Total: `TOTCFA`

5. **Descuentos en líneas:**
   - Descuento total: `DT1LAB + DT2LAB` (suma de porcentajes)

6. **Vencimientos:**
   - Solo existen si forma de pago es crédito
   - Se obtienen desde `CRT` donde `DOCCRT = CFA.NUMCFA`
   - Campo de fecha: `CRT.FVTCRT` (no `FEVCRT`)

7. **Estados:**
   - No hay campo explícito de estado
   - Se infiere: `TOTCFA < 0` → OVERDUE, sino → SENT
   - Pagos se registran en `PGS` o `CRT`

## Consideraciones Técnicas

### Prisma con SQL Server

1. **No usar `mode: 'insensitive'` en filtros:**
   - SQL Server no soporta este modo en Prisma
   - Usar solo `contains` sin `mode`

2. **Nombres de modelos:**
   - Prisma genera nombres con mayúsculas: `eNT`, `cFA`, `dIR`, etc.
   - Esto es por convención de Prisma para SQL Server

3. **Relaciones opcionales:**
   - `PAOENT` y `MONENT` no tienen FK explícitas en Prisma
   - Se guardan como números y se mapean manualmente

4. **Consultas separadas para relaciones:**
   - `FVE`, `FCS`, `FRC` no tienen relación directa en `ENT`
   - Se consultan por separado usando `findMany` con `where: { ENTFVE: { in: entityIds } }`

### Truncamiento de Strings

SQL Server puede dar error "String or binary data would be truncated" si se excede el tamaño del campo. Se aplica truncamiento en:

- `NIFENT`: máximo 50 caracteres
- `NCOENT`/`NOMENT`: máximo 255 caracteres
- `DIRDIR`: máximo 255 caracteres
- `POBDIR`: máximo 150 caracteres
- `CPODIR`: máximo 10 caracteres
- `TLFDIR`/`TL1DIR`: máximo 20 caracteres
- `EMADIR`: máximo 255 caracteres
- `TNIENT`: máximo 2 caracteres

### Valores por Defecto

Al crear entidades, se usan estos valores por defecto (inferidos de la BD):

- `DIV.IDEDIV = 1` → Euro
- `PAI.IDEPAI = 1` → España
- `PRO.IDEPRO = 30` → Málaga (si no se especifica provincia)
- `CFP.IDECFP = 1` → Contado (forma de pago)

## Estructura de Archivos Clave

```
src/
├── app/
│   ├── api/
│   │   ├── entities/
│   │   │   ├── route.ts              # GET, POST /api/entities
│   │   │   └── [id]/route.ts         # GET, PUT, DELETE /api/entities/[id]
│   │   └── invoices/
│   │       ├── route.ts              # GET, POST /api/invoices
│   │       └── [id]/route.ts         # GET, PUT, DELETE /api/invoices/[id]
│   ├── entidades/
│   │   └── page.tsx                  # Lista de entidades (usa API real)
│   └── facturacion/
│       ├── page.tsx                  # Lista de facturas
│       └── editar/[id]/page.tsx      # Vista detalle factura
├── lib/
│   ├── repositories/
│   │   ├── entities.ts               # EntitiesRepository
│   │   └── invoices.ts               # InvoicesRepository
│   └── prisma.ts                     # Configuración Prisma
└── components/
    ├── EntityModal.tsx               # Modal de entidades (usa API real)
    └── InvoiceModal.tsx              # Modal de facturas
```

## Estado de Implementación

### ✅ Completado

- [x] Integración completa de entidades con BD
- [x] Integración completa de facturas (lectura) con BD
- [x] Filtros por tipo de factura (emitida/recibida)
- [x] Cálculos correctos de totales de facturas
- [x] Mapeo correcto de todos los campos según DBA
- [x] Smoke tests pasando para entidades y facturas

### ⚠️ Pendiente / Bloqueado

- [ ] Creación de facturas (requiere `clienteId` y `piezaId` en payload)
- [ ] Actualización de facturas (requiere `clienteId` y `piezaId` en payload)
- [ ] Eliminación de entidades (bloqueado por riesgo de FK constraints)
- [ ] Eliminación de facturas (bloqueado por riesgo de FK constraints)
- [ ] Definir estrategia de numeración de facturas
- [ ] Definir manejo de `piezaId` en líneas de factura

## Notas Importantes

1. **Autenticación:** Deshabilitada en desarrollo, pero la estructura está lista
2. **Credenciales:** `DATABASE_URL` está en `.env.local` (no commiteado)
3. **Fallbacks:** Algunos scripts tienen fallbacks hardcodeados para desarrollo local (aceptable)
4. **Consistencia:** El botón "Ver" siempre abre el modal, desde el modal se puede navegar a página completa
5. **Filtros:** Los filtros de texto son case-sensitive en SQL Server (no hay modo insensitive)

## Conexión a Base de Datos

**String de conexión (desarrollo):**
```
sqlserver://localhost:1433;database=MotosMunozDatos;user=sa;password=sa2006Strong!;trustServerCertificate=true;encrypt=true
```

**Archivo de configuración:** `.env.local` (no commiteado)

**Prisma Client:** `src/lib/prisma.ts` - Configurado para SQL Server con PrismaMssql adapter


