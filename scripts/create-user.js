#!/usr/bin/env node

/**
 * Script to create a new user in the database
 * Usage: node scripts/create-user.js <username> <user_id>
 */

const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function createUser(username, userId, encryptedPassword) {
  try {
    console.log(`Creating user: ${username} with ID: ${userId}`);
    console.log(`Encrypted password: ${encryptedPassword}`);
    
    // First, let's check if the user already exists
    const existingUser = await prisma.$queryRaw`
      SELECT ENTUSU FROM USU WHERE ENTUSU = ${parseInt(userId)}
    `;
    
    if (existingUser && existingUser.length > 0) {
      console.log(`❌ User with ID ${userId} already exists!`);
      return;
    }
    
    // Create the user
    const result = await prisma.$queryRaw`
      INSERT INTO USU (ENTUSU, CONUSU, ACCUSU, ADMUSU, FEAUSU)
      VALUES (${parseInt(userId)}, ${encryptedPassword}, 1, 0, GETDATE())
    `;
    
    console.log('✅ User created successfully!');
    console.log('');
    console.log('User details:');
    console.log(`- User ID: ${userId}`);
    console.log(`- Username: ${username}`);
    console.log(`- Password: 12345 (encrypted as: ${encryptedPassword})`);
    console.log(`- Access Level: 1`);
    console.log(`- Admin Level: 0`);
    console.log('');
    console.log('You can now login with:');
    console.log(`- User ID: ${userId}`);
    console.log(`- Password: 12345`);
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    if (error.message.includes('PRIMARY KEY constraint')) {
      console.log('💡 The user ID already exists. Try a different user ID.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node scripts/create-user.js <username> <user_id>');
    console.log('Example: node scripts/create-user.js mack 1001');
    process.exit(1);
  }
  
  const username = args[0];
  const userId = args[1];
  
  // The encrypted password for "12345" is "rolif"
  const encryptedPassword = 'rolif';
  
  createUser(username, userId, encryptedPassword);
}

main();
