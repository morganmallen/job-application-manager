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

    // Check if database is empty or needs migration
    const { rows } = await client.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    const tableCount = parseInt(rows[0].table_count);
    console.log(`📊 Found ${tableCount} existing tables`);

    if (tableCount > 0) {
      console.log(
        '⚠️  Database already has tables. Dropping existing schema...',
      );

      // Drop all tables and types to ensure clean slate
      await client.query(`
        DO $$ DECLARE
          r RECORD;
        BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
        END $$;
      `);

      // Drop custom types
      await client.query(`
        DROP TYPE IF EXISTS application_status CASCADE;
        DROP TYPE IF EXISTS work_setup CASCADE;
        DROP TYPE IF EXISTS event_type CASCADE;
      `);

      console.log('✅ Existing schema dropped');
    }

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
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the initialization
initDatabase();
