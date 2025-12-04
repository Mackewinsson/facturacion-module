# Facturación module migration notes

Context to continue and finish the DB migration for invoices.

## Current state
- API: `/api/invoices` and `/api/invoices/[id]` now read from SQL Server (CFA joined with ENT and DIR/PRO) via `InvoiceDbService`.
- Returned shape (`InvoiceFromDb` in `src/lib/invoice-db-service.ts`):
  - `id`, `numero`, `fecha` (ISO string)
  - `clienteId`, `clienteNombre`, `clienteNif`
  - `direccion` (etiqueta/direccion/poblacion/provincia/codigoPostal)
  - `bases` (bi1/bi2/bi3), `cuotasIva` (ci1/ci2/ci3)
  - `totales` (baseImponible, iva, total)
- UI pages using live data: `/facturacion` list, `/facturacion/ver/[id]`, `/facturacion/editar/[id]`, `/facturacion/preview/[id]`, and `InvoiceModal`.
- Mapper hardened to tolerate nulls (e.g., `FECCFA` or `NUMCFA` missing).

## Pending gaps
- Create/update/delete not implemented: POST/PUT/DELETE in `/api/invoices` return 501.
- `SpanishInvoiceForm` still uses `MockInvoiceService` for create/update.
- Some filters are not wired to SQL: `baseImponible`, `iva`, `total`, `fecha`, `formaPago`, `medioPago`, `estado`, plus advanced `formaPago`/`lugarEmision` are currently ignored. `status` filter was dropped when switching to DB.
- UI fields tied to the old mock shape (line items, estado, forma/medio pago, tipoFactura, emisor) are not populated with DB data.

## Suggested next steps
1) Implement POST/PUT/DELETE against CFA (decide field mapping for NUMCFA, FECCFA, ENTCFA, DIRCFA, BI/CI/TOT, etc.).  
2) Update `SpanishInvoiceForm` to call the API (or direct service) and map form fields to CFA columns.  
3) Restore filter support in `InvoiceDbService` (status, fecha, importes, forma/medio pago, etc.).  
4) If needed, enrich `InvoiceFromDb` with extra fields (estado, formaPago, tipoFactura, emisor) by mapping more CFA/related tables.  
5) Align front-end displays (totals, columns) with whatever shape we finalize from the DB.
