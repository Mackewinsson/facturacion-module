import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { deletePhotoFromFTP } from '@/lib/ftp-service'

const prisma = new PrismaClient()

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const { photoId } = await params

    if (!photoId) {
      return NextResponse.json(
        { message: 'Photo ID is required' },
        { status: 400 }
      )
    }

    // Get photo information from database
    const photoData = await prisma.$queryRaw`
      SELECT NOTFOT FROM FOT WHERE ENTFOT = ${parseInt(photoId)}
    ` as { NOTFOT: string }[]

    if (photoData.length === 0) {
      return NextResponse.json(
        { message: 'Photo not found' },
        { status: 404 }
      )
    }

    const filePath = photoData[0].NOTFOT

    // Delete from FTP server
    const deleteResult = await deletePhotoFromFTP(filePath)
    
    if (!deleteResult.success) {
      console.error('FTP delete failed:', deleteResult.error)
      return NextResponse.json(
        { 
          message: deleteResult.error || 'Failed to delete photo from FTP server',
          error: 'FTP_DELETE_ERROR'
        },
        { status: 500 }
      )
    }

    // Delete from database
    await prisma.$executeRaw`
      DELETE FROM FOT WHERE ENTFOT = ${parseInt(photoId)}
    `
    
    return NextResponse.json({
      message: 'Photo deleted successfully from FTP server and database',
      id: photoId
    })

  } catch (error) {
    console.error('Delete photo error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}



