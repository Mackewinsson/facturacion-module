#!/usr/bin/env ts-node

/**
 * Utility script to encrypt passwords using the same algorithm as the VBA system
 * This can be used to generate encrypted passwords for testing or adding new users
 * 
 * Usage:
 *   npx ts-node src/scripts/encrypt-password.ts <password>
 *   or
 *   npm run encrypt-password <password>
 */

import { encriptarClave } from '../lib/encryption'

function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('Usage: npm run encrypt-password <password>')
    console.log('Example: npm run encrypt-password admin')
    process.exit(1)
  }
  
  const password = args[0]
  const encrypted = encriptarClave(password)
  
  console.log('Password Encryption Utility')
  console.log('==========================')
  console.log(`Original password: "${password}"`)
  console.log(`Encrypted password: "${encrypted}"`)
  console.log('')
  console.log('SQL to insert/update in CONUSU table:')
  console.log(`UPDATE CONUSU SET CLAUSU = '${encrypted}' WHERE ENTUSU = <user_id>;`)
  console.log('')
  console.log('Or to insert a new user:')
  console.log(`INSERT INTO CONUSU (ENTUSU, CLAUSU) VALUES (<user_id>, '${encrypted}');`)
}

if (require.main === module) {
  main()
}
