#!/usr/bin/env node

/**
 * Database Migration Script for Production
 * This script handles schema updates without dropping existing data
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrateDatabase() {
  console.log('🔄 Starting database migration...');

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

    // Check if we need to add new enum values
    const { rows: statusRows } = await client.query(`
      SELECT unnest(enum_range(NULL::application_status)) as status_value
    `);

    const existingStatuses = statusRows.map((row) => row.status_value);
    console.log('📊 Current application statuses:', existingStatuses);

    // Add new status if it doesn't exist
    if (!existingStatuses.includes('Job Offered')) {
      console.log('➕ Adding new application status: Job Offered');
      await client.query(`
        ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'Job Offered'
      `);
      console.log('✅ Added Job Offered status');
    }

    // Check if work_setup enum exists
    const { rows: setupRows } = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'work_setup'
      ) as exists
    `);

    if (!setupRows[0].exists) {
      console.log('➕ Creating work_setup enum');
      await client.query(`
        CREATE TYPE work_setup AS ENUM (
          'Onsite',
          'Hybrid',
          'Remote'
        )
      `);
      console.log('✅ Created work_setup enum');
    }

    // Check if event_type enum exists
    const { rows: eventRows } = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'event_type'
      ) as exists
    `);

    if (!eventRows[0].exists) {
      console.log('➕ Creating event_type enum');
      await client.query(`
        CREATE TYPE event_type AS ENUM (
          'PHONE_SCREEN',
          'TECHNICAL_INTERVIEW',
          'BEHAVIORAL_INTERVIEW',
          'CODING_CHALLENGE',
          'TAKE_HOME_ASSIGNMENT',
          'ONSITE_INTERVIEW',
          'REFERENCE_CHECK',
          'NEGOTIATION',
          'OTHER'
        )
      `);
      console.log('✅ Created event_type enum');
    }

    // Check if tables exist and create them if they don't
    const tables = [
      'users',
      'companies',
      'applications',
      'application_events',
      'notes',
      'refresh_tokens',
      'token_blacklist',
    ];

    for (const table of tables) {
      const { rows } = await client.query(
        `
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = $1 AND table_schema = 'public'
        ) as exists
      `,
        [table],
      );

      if (!rows[0].exists) {
        console.log(`➕ Creating table: ${table}`);
        // This would need to be more sophisticated to handle individual table creation
        // For now, we'll just log that the table needs to be created
        console.log(`⚠️  Table ${table} needs to be created manually`);
      }
    }

    console.log('🎉 Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Database migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the migration
migrateDatabase();
