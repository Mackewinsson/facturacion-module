import { NextResponse } from 'next/server'
import { getCompanyName, getCompanyInfo } from '@/lib/company-service'

/**
 * GET /api/company
 * Obtiene el nombre de la empresa principal
 */
export async function GET() {
  try {
    const companyName = await getCompanyName()
    
    return NextResponse.json({
      success: true,
      data: {
        name: companyName
      }
    })
  } catch (error) {
    console.error('Error en API company:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

/**
 * GET /api/company?info=true
 * Obtiene información completa de la empresa
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInfo = searchParams.get('info') === 'true'
    
    if (includeInfo) {
      const companyInfo = await getCompanyInfo()
      
      return NextResponse.json({
        success: true,
        data: companyInfo
      })
    } else {
      const companyName = await getCompanyName()
      
      return NextResponse.json({
        success: true,
        data: {
          name: companyName
        }
      })
    }
  } catch (error) {
    console.error('Error en API company:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
