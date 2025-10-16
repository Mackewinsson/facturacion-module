import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { listPhotosFromFTP } from '@/lib/ftp-service'

const prisma = new PrismaClient()

interface OrderEntity {
  ENTCAB: number;
}


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')

    if (!orderNumber) {
      return NextResponse.json(
        { message: 'Order number is required' },
        { status: 400 }
      )
    }

    // Check if order exists (optional - for validation)
    const orderDetails = await prisma.$queryRaw`
      SELECT ENTCAB FROM CAB WHERE NUMCAB = ${orderNumber}
    ` as OrderEntity[]

    if (orderDetails.length === 0) {
      console.log(`⚠️ Order ${orderNumber} not found in CAB table, but continuing with photo listing`)
    }

    // Get photos from DOT table for this order
    const dotPhotos = await prisma.$queryRaw`
      SELECT 
        IDEDOT as id,
        ALBDOT as orderNumber,
        NOMDOT as filename,
        LOCDOT as filePath
      FROM DOT 
      WHERE ALBDOT = ${orderNumber}
      ORDER BY IDEDOT DESC
    ` as { id: number, orderNumber: string, filename: string, filePath: string }[]

    // Transform DOT photos to our interface
    const transformedPhotos = dotPhotos.map((photo, index) => {
      // Generate URL from the DOT record
      const baseUrl = process.env.FTP_HTTP_BASE_URL || '/uploads'
      let photoUrl
      if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
        photoUrl = `${baseUrl}/${photo.orderNumber.toUpperCase()}/${photo.filename}`
      } else {
        const origin = process.env.APP_URL || 'http://localhost:3000'
        photoUrl = `${origin}${baseUrl}/${photo.orderNumber.toUpperCase()}/${photo.filename}`
      }
      
      return {
        id: `dot-${photo.id}-${index}`,
        url: photoUrl,
        filename: photo.filename,
        uploadedAt: new Date().toISOString(), // DOT table doesn't have upload date
        source: 'dot' // Track source for debugging
      }
    })

    // NEW: Also check FTP folder for additional files
    try {
      const ftpResult = await listPhotosFromFTP(orderNumber)
      
      if (ftpResult.success && ftpResult.files && ftpResult.files.length > 0) {
        const baseUrl = process.env.FTP_HTTP_BASE_URL || '/uploads'
        
        // Add FTP files that aren't already in DOT table
        ftpResult.files.forEach((filename, index) => {
          // Ensure we have a proper absolute URL
          let fileUrl
          if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
            fileUrl = `${baseUrl}/${orderNumber.toUpperCase()}/${filename}`
          } else {
            // If baseUrl is relative, make it absolute by adding the current origin
            const origin = process.env.APP_URL || 'http://localhost:3000'
            fileUrl = `${origin}${baseUrl}/${orderNumber.toUpperCase()}/${filename}`
          }
          
          // Check if this file is already in the DOT table results
          const alreadyExists = transformedPhotos.some(p => p.filename === filename)
          if (!alreadyExists) {
            transformedPhotos.push({
              id: `ftp-${filename}-${index}`,
              url: fileUrl,
              filename: filename,
              uploadedAt: new Date().toISOString(),
              source: 'ftp' // Track source for debugging
            })
          }
        })
        
        console.log(`📊 Total photos: ${transformedPhotos.length} (${dotPhotos.length} from DOT, ${ftpResult.files.length} from FTP)`)
      } else if (!ftpResult.success) {
        // FTP failed but don't break the response - still return DB photos
        console.warn(`⚠️ FTP listing failed: ${ftpResult.error}, returning DOT photos only`)
      }
    } catch (ftpError) {
      // Edge case: FTP check fails completely - log but continue with DB photos
      console.error('❌ Failed to check FTP folder:', ftpError)
      console.log('📋 Returning DOT photos only')
    }

    return NextResponse.json(transformedPhotos)

  } catch (error) {
    console.error('Get photos error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}



