-- ===========================================
-- CREATE USER: mack
-- ===========================================
-- This script creates a new user named "mack" with password "12345"
-- The password is encrypted using the VBA-compatible encryption algorithm

-- User Details:
-- - Username: mack
-- - User ID: 1001
-- - Password: 12345 (encrypted as: rolif)
-- - Access Level: 1
-- - Admin Level: 0

-- ===========================================
-- STEP 1: Check if user already exists
-- ===========================================
IF EXISTS (SELECT 1 FROM USU WHERE ENTUSU = 1001)
BEGIN
    PRINT 'User with ID 1001 already exists!'
    PRINT 'To update the password, run:'
    PRINT 'UPDATE USU SET CONUSU = ''rolif'' WHERE ENTUSU = 1001;'
END
ELSE
BEGIN
    -- ===========================================
    -- STEP 2: Create the new user
    -- ===========================================
    INSERT INTO USU (ENTUSU, CONUSU, ACCUSU, ADMUSU, FEAUSU)
    VALUES (1001, 'rolif', 1, 0, GETDATE());
    
    PRINT '✅ User "mack" created successfully!'
    PRINT ''
    PRINT 'User Details:'
    PRINT '- User ID: 1001'
    PRINT '- Username: mack'
    PRINT '- Password: 12345 (encrypted as: rolif)'
    PRINT '- Access Level: 1'
    PRINT '- Admin Level: 0'
    PRINT '- Created: ' + CONVERT(VARCHAR, GETDATE(), 120)
    PRINT ''
    PRINT 'You can now login with:'
    PRINT '- User ID: 1001'
    PRINT '- Password: 12345'
END

-- ===========================================
-- STEP 3: Verify the user was created
-- ===========================================
SELECT 
    ENTUSU as 'User ID',
    CONUSU as 'Encrypted Password',
    ACCUSU as 'Access Level',
    ADMUSU as 'Admin Level',
    FEAUSU as 'Created Date'
FROM USU 
WHERE ENTUSU = 1001;

-- ===========================================
-- NOTES:
-- ===========================================
-- 1. The password "12345" is encrypted as "rolif" using the VBA algorithm
-- 2. To change the password, encrypt the new password and update CONUSU field
-- 3. To encrypt passwords, use: npm run encrypt-password <new_password>
-- 4. The user will have access level 1 (standard user)
-- 5. The user will have admin level 0 (not admin)
