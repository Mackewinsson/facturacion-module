/**
 * Script to delete specific companies from the database
 * Companies to delete: MOTOS MUÑOZ S.C, MUÑOZ MARTIN BASILIO, BAENA BORREGO PILAR
 */

import { prisma } from '../src/lib/prisma'

const COMPANIES_TO_DELETE = [
  'MOTOS MUÑOZ S.C',
  'MOTOS MUNOZ S.C',
  'MUÑOZ MARTIN, BASILIO',
  'MUNOZ MARTIN, BASILIO',
  'BAENA BORREGO, PILAR'
]

async function findCompanies() {
  console.log('Searching for companies to delete...\n')
  
  const companies = await prisma.eNT.findMany({
    where: {
      OR: COMPANIES_TO_DELETE.map(name => ({
        NCOENT: {
          contains: name
        }
      }))
    },
    select: {
      IDEENT: true,
      NIFENT: true,
      NCOENT: true,
      NOMENT: true
    }
  })
  
  return companies
}

async function checkInvoices(entityIds: number[]) {
  // Check if these entities have any invoices
  const invoicesCount = await prisma.fAC.count({
    where: {
      OR: [
        { EMIFAC: { in: entityIds } },
        { ENFAC: { in: entityIds } }
      ]
    }
  })
  
  return invoicesCount
}

async function deleteCompany(entityId: number) {
  console.log(`Deleting entity ${entityId}...`)
  
  // Delete in correct order to respect foreign keys
  try {
    // Delete related records first
    await prisma.fCL.deleteMany({ where: { ENTFCL: entityId } })
    await prisma.fPR.deleteMany({ where: { ENTFPR: entityId } })
    await prisma.fVE.deleteMany({ where: { ENTFVE: entityId } })
    await prisma.fOT.deleteMany({ where: { ENTFOT: entityId } })
    await prisma.fCS.deleteMany({ where: { ENTFCS: entityId } })
    await prisma.fFI.deleteMany({ where: { ENTFFI: entityId } })
    await prisma.fTR.deleteMany({ where: { ENTFTR: entityId } })
    await prisma.fBA.deleteMany({ where: { ENTFBA: entityId } })
    await prisma.fRC.deleteMany({ where: { ENTFRC: entityId } })
    
    // Delete contacts
    await prisma.cON.deleteMany({ where: { ENTCON: entityId } })
    
    // Delete addresses
    await prisma.dIR.deleteMany({ where: { ENTDIR: entityId } })
    
    // Finally, delete the entity
    await prisma.eNT.delete({ where: { IDEENT: entityId } })
    
    console.log(`✓ Successfully deleted entity ${entityId}`)
    return true
  } catch (error) {
    console.error(`✗ Error deleting entity ${entityId}:`, error)
    return false
  }
}

async function main() {
  console.log('=== Delete Companies Script ===\n')
  
  // Find companies
  const companies = await findCompanies()
  
  if (companies.length === 0) {
    console.log('No companies found matching the criteria.')
    return
  }
  
  console.log(`Found ${companies.length} companies:\n`)
  companies.forEach(company => {
    console.log(`  - ID: ${company.IDEENT}`)
    console.log(`    NIF: ${company.NIFENT}`)
    console.log(`    Nombre: ${company.NCOENT}`)
    console.log(`    Comercial: ${company.NOMENT}\n`)
  })
  
  // Check for invoices
  const entityIds = companies.map(c => c.IDEENT)
  const invoicesCount = await checkInvoices(entityIds)
  
  if (invoicesCount > 0) {
    console.log(`⚠️  WARNING: These entities have ${invoicesCount} associated invoices.`)
    console.log('Deletion aborted. Please handle invoices first.')
    return
  }
  
  console.log('✓ No invoices found. Safe to delete.\n')
  
  // Delete companies
  console.log('Deleting companies...\n')
  let successCount = 0
  
  for (const company of companies) {
    const success = await deleteCompany(company.IDEENT)
    if (success) successCount++
  }
  
  console.log(`\n=== Summary ===`)
  console.log(`Successfully deleted: ${successCount}/${companies.length} companies`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())




