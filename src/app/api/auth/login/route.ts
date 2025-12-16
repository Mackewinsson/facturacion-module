import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verificarClave } from '@/lib/encryption'
import { signToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const { userId, password } = await request.json()

    if (!userId || !password) {
      return NextResponse.json(
        { message: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Get user password from USU table (CONUSU field)
    const passwordData = await prisma.$queryRaw`
      SELECT CONUSU as encryptedPassword
      FROM USU
      WHERE ENTUSU = ${parseInt(userId)}
    `

    if (!passwordData || (passwordData as Array<{ encryptedPassword: string }>).length === 0) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 401 }
      )
    }

    const encryptedPassword = (passwordData as Array<{ encryptedPassword: string }>)[0].encryptedPassword
    
    // Verify password using the encryption function
    if (!verificarClave(password, encryptedPassword)) {
      return NextResponse.json(
        { message: 'Contraseña inválida' },
        { status: 401 }
      )
    }

    // Get user information from the database
    const userData = await prisma.$queryRaw`
      SELECT 
        u.ENTUSU as userId,
        u.ACCUSU as accessLevel,
        u.ADMUSU as adminLevel,
        u.FEAUSU as createdAt,
        e.NCOENT as entityName,
        e.IDEENT as entityId
      FROM USU u
      LEFT JOIN ENT e ON u.ENTUSU = e.IDEENT
      WHERE u.ENTUSU = ${parseInt(userId)}
    `

    if (!userData || (userData as Array<{
      userId: number;
      accessLevel: number;
      adminLevel: number;
      createdAt: Date;
      entityName: string | null;
      entityId: number | null;
    }>).length === 0) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 401 }
      )
    }

    const user = (userData as Array<{
      userId: number;
      accessLevel: number;
      adminLevel: number;
      createdAt: Date;
      entityName: string | null;
      entityId: number | null;
    }>)[0]
    
    // Get all entities for this user
    const entities = await prisma.$queryRaw`
      SELECT IDEENT as id, NCOENT as name
      FROM ENT
      WHERE IDEENT = ${parseInt(userId)}
    `

    const userInfo = {
      id: user.userId.toString(),
      userId: user.userId,
      accessLevel: user.accessLevel,
      adminLevel: user.adminLevel,
      name: user.entityName || `Usuario ${user.userId}`,
      entities: entities as Array<{ id: number; name: string }>,
      createdAt: user.createdAt
    }

    // Generate JWT token
    const token = signToken({
      userId: user.userId,
      accessLevel: user.accessLevel,
      adminLevel: user.adminLevel
    })

    return NextResponse.json({
      user: userInfo,
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}