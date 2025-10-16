#!/usr/bin/env node

const { Client } = require('basic-ftp');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function testFTPUpload() {
  console.log('🧪 Testing FTP Upload Functionality...\n');

  const client = new Client();
  
  try {
    // FTP Configuration
    const config = {
      host: process.env.FTP_HOST || '192.168.8.11',
      port: parseInt(process.env.FTP_PORT || '21'),
      user: process.env.FTP_USER || 'recepUser',
      password: process.env.FTP_PASSWORD || '',
      secure: process.env.FTP_SECURE === 'true'
    };

    console.log('🔧 FTP Configuration:');
    console.log(`   Host: ${config.host}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Secure: ${config.secure}\n`);

    // Test order number
    const testOrderNumber = 'TEST123';
    const testFilename = 'test-image.png';

    // Create a test image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4, 0x00, 0x00, 0x00, 0x00,
      0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    console.log(`📁 Testing upload for order: ${testOrderNumber}`);
    console.log(`📄 Filename: ${testFilename}`);
    console.log(`📊 Buffer size: ${testImageBuffer.length} bytes\n`);

    // Connect to FTP
    console.log('🔌 Connecting to FTP server...');
    await client.access(config);
    console.log('✅ Connected successfully!\n');

    // Go to root directory
    console.log('📂 Navigating to root directory...');
    await client.cd('/');
    const currentDir = await client.pwd();
    console.log(`✅ Current directory: ${currentDir}\n`);

    // Check if directory exists
    const upperOrderNumber = testOrderNumber.toUpperCase();
    console.log(`🔍 Checking if directory ${upperOrderNumber} exists...`);
    
    let directoryExists = false;
    try {
      const currentDirBefore = await client.pwd();
      await client.cd(upperOrderNumber);
      await client.cd(currentDirBefore);
      directoryExists = true;
      console.log(`✅ Directory ${upperOrderNumber} exists`);
    } catch (error) {
      console.log(`❌ Directory ${upperOrderNumber} does not exist`);
    }

    // Create directory if it doesn't exist
    if (!directoryExists) {
      console.log(`📁 Creating directory ${upperOrderNumber}...`);
      await client.ensureDir(upperOrderNumber);
      console.log(`✅ Directory ${upperOrderNumber} created successfully`);
    }

    // Go back to root
    await client.cd('/');
    console.log('📂 Back to root directory\n');

    // Upload file
    console.log('🚀 Uploading file...');
    const fullRemotePath = `${upperOrderNumber}/${testFilename}`;
    console.log(`📍 Uploading to: ${fullRemotePath}`);
    
    // Create readable stream from buffer
    const { Readable } = require('stream');
    const stream = new Readable();
    stream.push(testImageBuffer);
    stream.push(null);

    await client.uploadFrom(stream, fullRemotePath);
    console.log('✅ File uploaded successfully!\n');

    // Verify upload
    console.log('🔍 Verifying upload...');
    try {
      await client.cd(upperOrderNumber);
      const files = await client.list();
      const uploadedFile = files.find(file => file.name === testFilename);
      
      if (uploadedFile) {
        console.log(`✅ File verified: ${uploadedFile.name} (${uploadedFile.size} bytes)`);
      } else {
        console.log('❌ File not found in directory listing');
      }
    } catch (error) {
      console.log('❌ Error verifying upload:', error.message);
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close connection
    try {
      client.close();
      console.log('\n🔌 FTP connection closed');
    } catch (error) {
      console.log('\n⚠️ Error closing connection:', error.message);
    }
  }

  console.log('\n🏁 Test completed.');
}

// Run the test
testFTPUpload().catch(console.error);
