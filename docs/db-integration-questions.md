# Preguntas para integrar Back-End y Base de Datos

## Objetivo
Conectar el backend de facturación para que el frontend deje de usar mocks (`MockEntityService`, `MockInvoiceService`) y lea/escriba desde la base de datos. Necesitamos confirmar tablas y campos en el esquema actual (`prisma/schema.prisma`, mapeado a SQL Server con muchas tablas legacy).

## Modelos Front que hoy usan mocks
- Entidades (cliente/proveedor/vendedor) con direcciones y teléfonos.
- Facturas (emitidas/recibidas/rectificativas) con líneas, totales, IVA/RE, forma y medio de pago, estados.

## Tablas candidatas vistas en `schema.prisma`
- **ENT**: entidad principal. Campos vistos: `IDEENT` (PK), `NIFENT` (unique), `NCOENT` (nombre comercial/razón social), `NOMENT`, `PERENT` (bool persona física), fechas `FEAENT`/`FEBENT`, flags web/whatsapp, `MONENT` (moneda), `PAOENT` (país), relaciones a `DIR`, `PER`, `USU`, `FTR`, `FVE`, `ZON`, etc.
- **DIR**: direcciones de entidad. Campos: `IDEDIR` (PK), `ENTDIR` (FK a `ENT`), `NOMDIR` (nombre/centro), `DIRDIR`, `POBDIR`, `CPODIR`, `PRODIR` (provincia), `PAIDIR` (país), teléfonos (`TLFDIR`, `TL1DIR`), email `EMADIR`.
- **PER**: personas/contactos ligados a entidad. Campos: `IDEPER` (PK), `ENTPER` (FK a `ENT`), `NOMPER`, `TLFPER`, `EMAPER`.
- **USU / FVE**: usuarios/empleados (posible vendedor). `FVE` tiene `ENTFVE` (parece FK a `ENT`). `USU` tiene `ENTUSU` (user id), `CONUSU` (password), etc.
- **CAB**: cabecera de documento/operación. Campos: `NUMCAB` (PK), referencias a `ENTCAB` (entidad), `DIRCAB`, `ALMCAB`, `PUECAB`, `DEPCAB`, `TIPCAB`, `IMPCAB` (impuesto), `FPACAB` (forma pago), `TRACAB`, `FACCAB` (número factura?), `FECCAB` (fecha), `OBSCAB`, totales `TOTCAB`, `COTCAB`, etc. Parece ser la cabecera reutilizada para facturas/OT albaranes.
- **LAT**: líneas ligadas a `CAB`. Campos: `CABLAT` (FK a `NUMCAB`), `NOMLAT`, `PRELAT` (precio), `CANLAT` (cantidad), `IMPLAT` (importe), `TASLAT` (tasa/IVA FK a `TAS`), `IVALAT` (iva %), etc.
- **TAS**: tabla de tasas/impuestos. Campos: `IMPTAS` (monto), `CODTAS`, `TIPTAS`. Relaciona con `LAT`.
- **IVA**: tabla de tipos de IVA. Campos: `IDEIVA`, probablemente porcentaje/descr. Se relaciona con `Piezas`.
- **Piezas**: artículos. Campos: `IDPieza`, `TipoPieza`, `ReferenciaPieza`, `DenominacionPieza`, `PVPPieza`, `IvaPieza` (FK a `IVA`), `ProveedorPriPieza` (FK a `FPR`), etc.
- **FPR**: parece proveedores (FK desde piezas y otras tablas), con clave `ENTFPR`.
- **TES / PGS**: tesorería/pagos. `TES` ligado a cuentas; `PGS` tiene `NUMPGS`, `ENTPGS`, `TESPGS`, flags de pago.
- **ZON / PAI / PRO / POB**: catálogos de zona/país/provincia/población usados por `ENT` y `DIR`.

> Nota: muchas tablas están `@@ignore` o sin PK válida; nos centramos en las que parecen usables para facturación y entidades.

## Campos que el frontend necesita

### Entidad (cliente/proveedor/vendedor)
- Identificación: `NIF`, `razonSocial`, `nombreComercial`.
- Fechas: `fechaAlta`, `fechaBaja`.
- Clasificación: `personaFisica`, `tipoIdentificador` (NIF/NIE/pasaporte), `paisOrigen`, `extranjero`, `operadorIntracomunitario`, `importacionExportacion`, `regimenCanario`.
- Relaciones (checkboxes): `proveedor`, `cliente`, `vendedor`, `operarioTaller`, `aseguradora`, `financiera`, `agenciaTransporte`, `banco`, `rentacar`.
- Moneda: `monedaEntidad`.
- Contacto: `telefono`, `email`.
- Direcciones (lista): `centro/nombre`, `direccion`, `telefono`, `telefonoMovil`, `email`.

### Factura
- Cabecera: `tipoFactura` (emitida/recibida/rectificativa), `serie`, `numero`, `fechaExpedicion`, `fechaContable`, `lugarEmision`, `departamento`.
- Cliente/proveedor asociado (referencia a entidad) + su dirección y NIF.
- Líneas: descripción, cantidad, precio unitario, descuento, `tipoIVA`, `recargoEquivalencia`, totales por línea (base, IVA, RE, total).
- Totales factura: base imponible total, cuota IVA total, cuota RE total, total factura, retención IRPF opcional.
- Pago: `formaPago`, `medioPago`, `fechaVencimiento`.
- Estado: `status` (DRAFT/SENT/PAID/etc).
- Rectificativa: `esRectificativa`, `causaRectificacion`, `referenciasFacturasRectificadas`.

## Preguntas/confirmaciones para el DBA
1) **Entidades**  
   - ¿Confirmas que `ENT` es la tabla fuente para clientes/proveedores/vendedores?  
   - ¿Qué campo de `ENT` mapea a: razón social (`NCOENT` o `NOMENT`), nombre comercial, persona física (`PERENT`), país (`PAOENT`), moneda (`MONENT`), flags operador intracomunitario/export-import/canario?  
   - ¿Cómo se modelan los roles (cliente/proveedor/vendedor)? ¿Hay campos booleanos en `ENT` o se usa otra tabla (ej. `ERD`, `FPR`, `FVE`)?

2) **Direcciones**  
   - ¿`DIR` es la tabla de direcciones por entidad (`ENTDIR` FK)?  
   - ¿Qué campo usar para el “centro”/alias de dirección (`NOMDIR`)?  
   - ¿Hay tabla de “población”/“provincia”/“país” relacionada (`POB`, `PRO`, `PAI`)? ¿Podemos guardar libre texto si no hay catálogo?

3) **Contactos personales**  
   - ¿`PER` es la tabla correcta para contactos de una entidad? ¿Se necesita otra relación?  
   - Campos mínimos: nombre, teléfono, email.

4) **Usuarios/Vendedores**  
   - `USU` y/o `FVE`: ¿cuál usar para asignar “vendedor/comercial” en facturas? ¿Clave primaria de vendedor es `ENTFVE`?

5) **Facturas**  
   - ¿`CAB` es la cabecera de factura/OT? Si sí:  
     - ¿Qué campos usar para: serie/número (`NUMCAB`/`FACCAB`/`TIPCAB`?), fechas (`FECCAB`), estado (`ESTCAB`?), total (`TOTCAB`), base/impuesto (`COTCAB`?).  
     - Relación a cliente/proveedor: ¿`ENTCAB` (FK a `ENT`)? Dirección: `DIRCAB`?  
   - Líneas: ¿`LAT` es la tabla de líneas? Confirmar columnas para cantidad (`CANLAT`), precio (`PRELAT`), importe (`IMPLAT`), IVA (`TASLAT`/`IVALAT`).  
   - IVA/RE: ¿`TAS` contiene el porcentaje? ¿Existe tabla para recargo de equivalencia?  
   - Rectificativas: ¿hay campos para enlazar factura rectificada (quizá `REFCAB`)? ¿Se usa otro flujo?

6) **Artículos/Piezas y tipos impositivos**  
   - ¿Productos salen de `Piezas`? Campos: referencia, descripción (`DenominacionPieza`), PVP (`PVPPieza`), IVA (`IvaPieza` FK a `IVA`).  
   - ¿`IVA` guarda tipo 0/4/10/21? ¿Algún campo de recargo equivalente?  
   - ¿`TAS` se usa sólo para líneas (servicios) o también para artículos?

7) **Pagos**  
   - ¿Formas/medios de pago se referencian con `TES`, `PGS` u otra tabla? ¿Qué campo debe guardar el código de forma de pago que muestra el frontend?

8) **Estados**  
   - ¿Existe catálogo de estados de factura o se usa campo numérico en `CAB`? ¿Valores esperados para DRAFT/SENT/PAID/OVERDUE/CANCELLED?

9) **Constraints y generación de números**  
   - ¿Cómo se genera el número de factura (serie + correlativo)? ¿Hay SP o secuencia que debamos llamar?  
   - ¿Hay reglas distintas para emitidas vs recibidas vs rectificativas?

10) **Multimoneda e impuestos especiales**  
    - ¿`MONENT`/`DIV` controla moneda? ¿Debemos guardar tipo de cambio?  
    - ¿Algún campo para impuestos canarios/ISP que debamos respetar?

## Datos mínimos que necesitamos exponer en API
- Listar entidades con NIF, razón social, teléfono, email, roles, país, moneda, flags, y sus direcciones.
- CRUD de entidades (incluye direcciones y contacto principal).
- Listar facturas con cliente, fechas, totales, IVA, estado, forma/medio de pago.
- CRUD de facturas con líneas; cálculo de totales se hace en backend con reglas de IVA/RE.
- Catálogos: tipos de IVA, formas/medios de pago, países/provincias/municipios (si aplican), artículos/piezas para autocompletar líneas.

## Qué esperamos del DBA
- Confirmar tablas y columnas a usar para cada dato anterior.
- Confirmar claves primarias/foráneas y si hay vistas o SP recomendadas.
- Indicar si hay triggers/reglas que debamos respetar para insertar/actualizar.
- Proveer ejemplos de inserts válidos para: entidad con dirección + factura con 1 línea.

## Próximos pasos
1. Recibir mapping confirmado (tabla.campo ↔ campo frontend) y restricciones.  
2. Ajustar prisma schema/ORM y endpoints para leer/escribir en esas tablas.  
3. Probar flujos de: crear entidad, listar entidades filtrando por NIF/nombre/teléfono; crear factura con líneas y totales.




