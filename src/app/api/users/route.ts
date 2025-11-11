import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get active users (where FEBUSU is null) with their associated entities
    const users = await prisma.$queryRaw`
      SELECT 
        u.ENTUSU as userId,
        u.ACCUSU as accessLevel,
        u.ADMUSU as adminLevel,
        u.FEAUSU as createdAt,
        e.NCOENT as entityName,
        e.IDEENT as entityId
      FROM USU u
      LEFT JOIN ENT e ON u.ENTUSU = e.IDEENT
      WHERE u.FEBUSU IS NULL
      ORDER BY u.ACCUSU DESC, u.ENTUSU ASC
    `

    // Group users by their ID and collect their entities
    const userMap = new Map()
    
    for (const user of users as Array<{
      userId: number;
      accessLevel: number;
      adminLevel: number;
      createdAt: Date;
      entityName: string | null;
      entityId: number | null;
    }>) {
      const userId = user.userId
      
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          id: userId,
          accessLevel: user.accessLevel,
          adminLevel: user.adminLevel,
          createdAt: user.createdAt,
          entities: []
        })
      }
      
      if (user.entityName) {
        userMap.get(userId).entities.push({
          id: user.entityId,
          name: user.entityName
        })
      }
    }

    const userList = Array.from(userMap.values()).map(user => ({
      id: user.id,
      accessLevel: user.accessLevel,
      adminLevel: user.adminLevel,
      createdAt: user.createdAt,
      displayName: user.entities.length > 0 
        ? `${user.entities[0].name} (Nivel ${user.accessLevel})`
        : `Usuario ${user.id} (Nivel ${user.accessLevel})`,
      entities: user.entities
    }))

    return NextResponse.json(userList)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { message: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}
