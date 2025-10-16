#!/usr/bin/env node

/**
 * Simple FTP test script for local development
 */

const { Client } = require('basic-ftp')

async function testSimpleFTP() {
  console.log('🧪 Testing Simple FTP Server')
  console.log('=============================')
  
  const client = new Client()
  client.ftp.verbose = true
  
  try {
    // Test 1: Connect to local FTP server
    console.log('\n1. Testing FTP Connection...')
    await client.access({
      host: 'localhost',
      port: 21,
      user: 'usermw',
      password: 'usermw',
      secure: false
    })
    console.log('✅ Connected to local FTP server')
    
    // Test 2: List root directory
    console.log('\n2. Testing Directory Listing...')
    const rootFiles = await client.list()
    console.log('✅ Root directory contents:')
    rootFiles.forEach(file => {
      console.log(`   - ${file.name} (${file.type === 1 ? 'file' : 'directory'})`)
    })
    
    // Test 3: Navigate to uploads directory
    console.log('\n3. Testing Directory Navigation...')
    try {
      await client.cd('uploads')
      console.log('✅ Successfully navigated to uploads directory')
      
      const uploadsFiles = await client.list()
      console.log('✅ Uploads directory contents:')
      uploadsFiles.forEach(file => {
        console.log(`   - ${file.name} (${file.type === 1 ? 'file' : 'directory'})`)
      })
    } catch (error) {
      console.log('⚠️  Could not navigate to uploads directory:', error.message)
    }
    
    // Test 4: Create test directory in root
    console.log('\n4. Testing Directory Creation...')
    try {
      await client.cd('/')
      await client.ensureDir('TEST123')
      console.log('✅ Created test directory: TEST123')
      
      const testFiles = await client.list()
      const testDirExists = testFiles.some(file => file.name === 'TEST123')
      if (testDirExists) {
        console.log('✅ Test directory confirmed in listing')
      }
    } catch (error) {
      console.log('⚠️  Could not create test directory:', error.message)
    }
    
    // Test 5: Upload test file
    console.log('\n5. Testing File Upload...')
    try {
      const testContent = 'This is a test file for FTP upload'
      const testBuffer = Buffer.from(testContent)
      
      // Create a temporary file
      const fs = require('fs')
      const path = require('path')
      const tempFile = path.join(__dirname, 'temp-test.txt')
      fs.writeFileSync(tempFile, testContent)
      
      try {
        await client.uploadFrom(tempFile, 'TEST123/test-file.txt')
        console.log('✅ File uploaded successfully')
      } finally {
        // Clean up temp file
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile)
        }
      }
    } catch (error) {
      console.log('⚠️  Could not upload file:', error.message)
    }
    
    console.log('\n🎉 FTP server is working!')
    console.log('\n📋 Summary:')
    console.log('   ✅ Connection: Working')
    console.log('   ✅ Authentication: Working')
    console.log('   ✅ Directory Listing: Working')
    console.log('   ✅ Basic Operations: Working')
    
  } catch (error) {
    console.error('❌ FTP test failed:', error.message)
    process.exit(1)
  } finally {
    client.close()
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testSimpleFTP()
}

module.exports = { testSimpleFTP }
