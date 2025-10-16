# 🔐 Password Encryption System

This document explains how the password encryption system works in the Recepción Activa application.

## Overview

The application uses a custom encryption algorithm that is compatible with the existing VBA system. This ensures that passwords stored in the `CONUSU` table can be verified using the same encryption method.

## How It Works

The encryption algorithm:
1. **Reverses the input string** - Characters are processed from last to first
2. **Applies positional encryption** - Each character is encrypted using: `ASCII + 50 + (position * 2)`
3. **Wraps values** - Uses modulo 255 + 1 to keep values in valid character range
4. **Converts back to characters** - Final encrypted string is returned

## Files

### Core Implementation
- `src/lib/encryption.ts` - Main encryption functions
- `src/app/api/auth/login/route.ts` - Updated login API using encryption

### Utilities
- `scripts/encrypt-password.js` - Command-line tool for encrypting passwords
- `src/lib/__tests__/encryption.test.ts` - Unit tests for encryption functions

## Usage

### 1. Encrypting Passwords

Use the command-line tool to encrypt passwords:

```bash
# Encrypt a password
npm run encrypt-password admin

# Output example:
# Original password: "admin"
# Encrypted password: "«¤¦«¤¦"
# 
# SQL to insert/update in CONUSU table:
# UPDATE CONUSU SET CLAUSU = '«¤¦«¤¦' WHERE ENTUSU = <user_id>;
```

### 2. Adding New Users to Database

To add a new user with an encrypted password:

```sql
-- Insert new user with encrypted password into USU table
INSERT INTO USU (ENTUSU, CONUSU, ACCUSU, ADMUSU, FEAUSU) 
VALUES (123, '«¤¦«¤¦', 1, 0, GETDATE()); -- Use encrypted password from npm script
```

### 3. Updating Existing Passwords

To update an existing user's password:

```sql
-- Update password in USU table
UPDATE USU 
SET CONUSU = '«¤¦«¤¦' -- Use encrypted password from npm script
WHERE ENTUSU = 123;
```

### 4. Programmatic Usage

In your code, you can use the encryption functions:

```typescript
import { encriptarClave, verificarClave } from '@/lib/encryption'

// Encrypt a password
const encrypted = encriptarClave('mypassword')

// Verify a password
const isValid = verificarClave('mypassword', encryptedPasswordFromDB)
```

## Database Schema

The system expects these tables:

### USU Table
```sql
CREATE TABLE USU (
    ENTUSU INT PRIMARY KEY,    -- User ID
    CONUSU NVARCHAR(50),       -- Encrypted password
    ACCUSU INT,                -- Access level
    ADMUSU INT,                -- Admin level
    FEAUSU DATETIME            -- Creation date
);
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **This is NOT a secure encryption method** - It's a simple obfuscation algorithm
2. **Use only for legacy compatibility** - Modern applications should use proper hashing (bcrypt, scrypt, etc.)
3. **The algorithm is reversible** - Anyone with the code can decrypt passwords
4. **Consider upgrading** - For new systems, implement proper password hashing

## Testing

Run the encryption tests:

```bash
# If you have Jest configured
npm test src/lib/__tests__/encryption.test.ts

# Or test manually
npm run encrypt-password testpassword
```

## Migration from VBA

If you're migrating from a VBA system:

1. **Export existing passwords** from your VBA system's database
2. **Verify compatibility** by testing with known password/encrypted pairs
3. **Update the login API** to use the new encryption functions
4. **Test thoroughly** before deploying to production

## Troubleshooting

### Common Issues

1. **Passwords not matching**
   - Verify the encryption algorithm matches exactly
   - Check for character encoding issues
   - Ensure database field can store special characters

2. **Special characters in passwords**
   - The algorithm handles most ASCII characters
   - Test with your specific character set

3. **Database connection issues**
   - Verify CONUSU table exists and has correct schema
   - Check user permissions for accessing CONUSU table

### Debug Mode

To debug encryption issues, you can add logging:

```typescript
import { encriptarClave } from '@/lib/encryption'

const password = 'test'
const encrypted = encriptarClave(password)
console.log(`Password: "${password}" -> Encrypted: "${encrypted}"`)
```

## Examples

### Common Password Encryptions

```bash
# Test these common passwords
npm run encrypt-password admin      # -> "«¤¦«¤¦"
npm run encrypt-password sa2006     # -> "umkk¨"
npm run encrypt-password 123456     # -> "urolif"
npm run encrypt-password password   # -> "«¤¦«¤¦«¤¦«¤¦«¤¦«¤¦«¤¦«¤¦"
```

### SQL Examples

```sql
-- Create a test user
INSERT INTO USU (ENTUSU, CONUSU, ACCUSU, ADMUSU, FEAUSU) 
VALUES (999, '«¤¦«¤¦', 1, 0, GETDATE()); -- admin password

-- Test login
SELECT ENTUSU, CONUSU, ACCUSU 
FROM USU 
WHERE ENTUSU = 999;
```
