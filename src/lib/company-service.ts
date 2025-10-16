import { prisma } from './prisma'

/**
 * Obtiene el nombre de la empresa principal desde la base de datos
 * Busca el parámetro 'EmprGest' en la tabla PRM para obtener la ID de la empresa
 * Luego busca en la tabla ENT el nombre comercial (NCOENT)
 * 
 * @returns Promise<string> - El nombre de la empresa o 'Empresa' como fallback
 */
export async function getCompanyName(): Promise<string> {
  try {
    // 1. Buscar el parámetro EmprGest en la tabla PRM
    const empresaParam = await prisma.pRM.findUnique({
      where: {
        NOMPRM: 'EmprGest'
      },
      select: {
        VALPRM: true
      }
    })

    if (!empresaParam?.VALPRM) {
      console.warn('Parámetro EmprGest no encontrado en la tabla PRM')
      return 'Empresa'
    }

    // 2. Convertir VALPRM a número (ID de la empresa)
    const empresaId = parseInt(empresaParam.VALPRM)
    
    if (isNaN(empresaId)) {
      console.warn('VALPRM no es un número válido:', empresaParam.VALPRM)
      return 'Empresa'
    }

    // 3. Buscar la empresa en la tabla ENT
    const empresa = await prisma.eNT.findUnique({
      where: {
        IDEENT: empresaId
      },
      select: {
        NCOENT: true,
        NOMENT: true
      }
    })

    if (!empresa) {
      console.warn(`Empresa con ID ${empresaId} no encontrada en la tabla ENT`)
      return 'Empresa'
    }

    // 4. Retornar el nombre comercial (NCOENT) o el nombre (NOMENT) como fallback
    return empresa.NCOENT || empresa.NOMENT || 'Empresa'

  } catch (error) {
    console.error('Error al obtener el nombre de la empresa:', error)
    return 'Empresa'
  }
}

/**
 * Obtiene información completa de la empresa principal
 * 
 * @returns Promise<{id: number, nombreComercial: string, nombre: string | null} | null>
 */
export async function getCompanyInfo(): Promise<{
  id: number
  nombreComercial: string
  nombre: string | null
} | null> {
  try {
    // 1. Buscar el parámetro EmprGest en la tabla PRM
    const empresaParam = await prisma.pRM.findUnique({
      where: {
        NOMPRM: 'EmprGest'
      },
      select: {
        VALPRM: true
      }
    })

    if (!empresaParam?.VALPRM) {
      console.warn('Parámetro EmprGest no encontrado en la tabla PRM')
      return null
    }

    // 2. Convertir VALPRM a número (ID de la empresa)
    const empresaId = parseInt(empresaParam.VALPRM)
    
    if (isNaN(empresaId)) {
      console.warn('VALPRM no es un número válido:', empresaParam.VALPRM)
      return null
    }

    // 3. Buscar la empresa en la tabla ENT
    const empresa = await prisma.eNT.findUnique({
      where: {
        IDEENT: empresaId
      },
      select: {
        IDEENT: true,
        NCOENT: true,
        NOMENT: true
      }
    })

    if (!empresa) {
      console.warn(`Empresa con ID ${empresaId} no encontrada en la tabla ENT`)
      return null
    }

    return {
      id: empresa.IDEENT,
      nombreComercial: empresa.NCOENT,
      nombre: empresa.NOMENT
    }

  } catch (error) {
    console.error('Error al obtener la información de la empresa:', error)
    return null
  }
}
