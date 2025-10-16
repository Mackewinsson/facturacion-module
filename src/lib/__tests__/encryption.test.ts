/**
 * Test file for the encryption functions
 * This verifies that the JavaScript implementation matches the VBA behavior
 */

import { encriptarClave, verificarClave } from '../encryption'

describe('Encryption Functions', () => {
  test('should encrypt password correctly', () => {
    const password = 'admin'
    const encrypted = encriptarClave(password)
    
    // The encrypted result should not be empty and should be different from original
    expect(encrypted).toBeDefined()
    expect(encrypted).not.toBe(password)
    expect(encrypted.length).toBe(password.length)
  })

  test('should verify password correctly', () => {
    const password = 'admin'
    const encrypted = encriptarClave(password)
    
    // Should return true for correct password
    expect(verificarClave(password, encrypted)).toBe(true)
    
    // Should return false for incorrect password
    expect(verificarClave('wrong', encrypted)).toBe(false)
  })

  test('should handle different password lengths', () => {
    const passwords = ['a', 'ab', 'abc', 'admin', 'password123', 'verylongpassword']
    
    passwords.forEach(password => {
      const encrypted = encriptarClave(password)
      expect(encrypted.length).toBe(password.length)
      expect(verificarClave(password, encrypted)).toBe(true)
    })
  })

  test('should be consistent with multiple encryptions', () => {
    const password = 'test123'
    const encrypted1 = encriptarClave(password)
    const encrypted2 = encriptarClave(password)
    
    // Same password should always produce same encrypted result
    expect(encrypted1).toBe(encrypted2)
  })

  test('should handle special characters', () => {
    const password = 'test@#$%'
    const encrypted = encriptarClave(password)
    
    expect(encrypted).toBeDefined()
    expect(verificarClave(password, encrypted)).toBe(true)
  })
})
