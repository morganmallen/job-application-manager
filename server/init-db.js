#!/usr/bin/env node

/**
 * Database Initialization Script for Production
 * This script sets up the database schema when deploying to production
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  console.log('🚀 Initializing database...');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read the schema file
    const schemaPath = path.join(
      __dirname,
      '..',
      'database',
      'complete_schema.sql',
    );
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await client.query(schema);
    console.log('✅ Database schema applied successfully');

    // Insert seed data if in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🌱 Inserting seed data...');
      const seedPath = path.join(__dirname, 'src', 'seed.ts');
      if (fs.existsSync(seedPath)) {
        // Note: In production, you might want to run this differently
        console.log('✅ Seed data ready (run npm run seed manually if needed)');
      }
    }

    console.log('🎉 Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the initialization
initDatabase();
