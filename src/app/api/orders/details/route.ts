import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

interface OrderDetails {
  numeroOrden: string;
  fecha: Date;
  estado: string;
  total: number;
  subtotal: number;
  observaciones: string | null;
  albaran: string | null;
  factura: string | null;
  urgencia: string | null;
  prioridad: string | null;
  tipo: string | null;
  impuesto: number | null;
  formaPago: string | null;
  transporte: string | null;
  porcentaje: number | null;
  referencia: string | null;
  lineas: number | null;
  division: string | null;
  coste: number | null;
  fechaCreacion: Date | null;
  cliente: string | null;
  nifCliente: string | null;
  telefonoCliente: string | null;
  matricula: string | null;
  nombreVehiculo: string | null;
  bastidor: string | null;
  motor: string | null;
  estadoVehiculo: string | null;
  costeVehiculo: number | null;
  nivelUsuario: number | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const numero = searchParams.get('numero')

    if (!numero) {
      return NextResponse.json(
        { message: 'Order number is required' },
        { status: 400 }
      )
    }

    // Get detailed order information including vehicle data
    const orderDetails = await prisma.$queryRaw`
      SELECT 
        c.NUMCAB as numeroOrden,
        c.FECCAB as fecha,
        c.ESTCAB as estado,
        c.TOTCAB as total,
        c.BITCAB as subtotal,
        c.OBSCAB as observaciones,
        c.ALPCAB as albaran,
        c.FACCAB as factura,
        c.URGCAB as urgencia,
        c.PPGCAB as prioridad,
        c.TIPCAB as tipo,
        c.IMPCAB as impuesto,
        c.FPACAB as formaPago,
        c.TRACAB as transporte,
        c.PORCAB as porcentaje,
        c.REFCAB as referencia,
        c.LINCAB as lineas,
        c.DIVCAB as division,
        c.COTCAB as coste,
        c.FCRCAB as fechaCreacion,
        e.NCOENT as cliente,
        e.NIFENT as nifCliente,
        e.TNIENT as telefonoCliente,
        v.MATVEH as matricula,
        v.NOMVEH as nombreVehiculo,
        v.BASVEH as bastidor,
        v.MOTVEH as motor,
        v.ESTVEH as estadoVehiculo,
        v.COSVEH as costeVehiculo,
        u.ACCUSU as nivelUsuario
      FROM CAB c
      LEFT JOIN ENT e ON c.ENTCAB = e.IDEENT
      LEFT JOIN OTR o ON c.NUMCAB = o.ALBOTR
      LEFT JOIN VEH v ON o.VEHOTR = v.IDEVEH
      LEFT JOIN USU u ON c.USUCAB = u.ENTUSU
      WHERE c.NUMCAB = ${numero}
    `

    if (!orderDetails || (orderDetails as OrderDetails[]).length === 0) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      )
    }

    const order = (orderDetails as OrderDetails[])[0]

    return NextResponse.json(order)
  } catch (error) {
    console.error('Order details error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
