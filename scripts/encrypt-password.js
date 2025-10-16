#!/usr/bin/env node

/**
 * Utility script to encrypt passwords using the same algorithm as the VBA system
 * This can be used to generate encrypted passwords for testing or adding new users
 * 
 * Usage:
 *   node scripts/encrypt-password.js <password>
 *   or
 *   npm run encrypt-password <password>
 */

function encriptarClave(cadena) {
  // Hay q mantener el original que nos pasan intacto
  let encrypted = '';
  
  // For i = Len(cadena) To 1 Step -1 (reverse iteration)
  for (let i = cadena.length; i >= 1; i--) {
    // Get character at position i (1-based indexing in VBA, 0-based in JS)
    const char = cadena[i - 1];
    
    // Get ASCII value of the character
    const asciiValue = char.charCodeAt(0);
    
    // Apply encryption: ASCII + 50 + (position * 2)
    const encryptedValue = (asciiValue + 50 + i * 2) % 255 + 1;
    
    // Convert back to character and append
    encrypted += String.fromCharCode(encryptedValue);
  }
  
  return encrypted;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npm run encrypt-password <password>');
    console.log('Example: npm run encrypt-password admin');
    process.exit(1);
  }
  
  const password = args[0];
  const encrypted = encriptarClave(password);
  
  console.log('Password Encryption Utility');
  console.log('==========================');
  console.log(`Original password: "${password}"`);
  console.log(`Encrypted password: "${encrypted}"`);
  console.log('');
  console.log('SQL to insert/update in USU table:');
  console.log(`UPDATE USU SET CONUSU = '${encrypted}' WHERE ENTUSU = <user_id>;`);
  console.log('');
  console.log('Or to insert a new user:');
  console.log(`INSERT INTO USU (ENTUSU, CONUSU, ACCUSU, ADMUSU, FEAUSU) VALUES (<user_id>, '${encrypted}', 1, 0, GETDATE());`);
}

main();
