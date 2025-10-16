/**
 * JavaScript equivalent of the VBA encriptarClave function
 * This function encrypts passwords using the same algorithm as the original VBA system
 * to maintain compatibility with the existing conusu table
 */

export function encriptarClave(cadena: string): string {
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

/**
 * Verify if a plain text password matches an encrypted password from the database
 * @param plainPassword - The plain text password to verify
 * @param encryptedPassword - The encrypted password from the database
 * @returns boolean - true if passwords match, false otherwise
 */
export function verificarClave(plainPassword: string, encryptedPassword: string): boolean {
  const encrypted = encriptarClave(plainPassword);
  return encrypted === encryptedPassword;
}

/**
 * Test function to verify the encryption works correctly
 * You can use this to test against known encrypted values from your database
 */
export function testEncryption() {
  console.log('Testing encryption function:');
  
  // Test with some sample passwords
  const testPasswords = ['admin', 'password', '123456', 'test'];
  
  testPasswords.forEach(password => {
    const encrypted = encriptarClave(password);
    console.log(`Password: "${password}" -> Encrypted: "${encrypted}"`);
  });
}
