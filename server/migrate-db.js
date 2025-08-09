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

    // Check if notification_type enum exists
    const { rows: notificationTypeRows } = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'notification_type'
      ) as exists
    `);

    if (!notificationTypeRows[0].exists) {
      console.log('➕ Creating notification_type enum');
      await client.query(`
        CREATE TYPE notification_type AS ENUM (
          'INTERVIEW_REMINDER',
          'APPLICATION_UPDATE',
          'SYSTEM'
        )
      `);
      console.log('✅ Created notification_type enum');
    }

    // Check if notification_status enum exists
    const { rows: notificationStatusRows } = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'notification_status'
      ) as exists
    `);

    if (!notificationStatusRows[0].exists) {
      console.log('➕ Creating notification_status enum');
      await client.query(`
        CREATE TYPE notification_status AS ENUM (
          'UNREAD',
          'READ'
        )
      `);
      console.log('✅ Created notification_status enum');
    }

    // Check if notifications table exists
    const { rows: notificationsTableRows } = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'notifications' AND table_schema = 'public'
      ) as exists
    `);

    if (!notificationsTableRows[0].exists) {
      console.log('➕ Creating notifications table');

      try {
        // Create notifications table
        await client.query(`
          CREATE TABLE notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            type notification_type NOT NULL DEFAULT 'INTERVIEW_REMINDER',
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            status notification_status NOT NULL DEFAULT 'UNREAD',
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            event_id UUID REFERENCES application_events(id) ON DELETE CASCADE,
            scheduled_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
          )
        `);
        console.log('✅ Created notifications table');

        // Create indexes
        await client.query(`
          CREATE INDEX idx_notifications_user_id ON notifications(user_id);
          CREATE INDEX idx_notifications_status ON notifications(status);
          CREATE INDEX idx_notifications_type ON notifications(type);
          CREATE INDEX idx_notifications_created_at ON notifications(created_at);
          CREATE INDEX idx_notifications_event_id ON notifications(event_id);
        `);
        console.log('✅ Created notifications indexes');

        // Create trigger
        await client.query(`
          CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `);
        console.log('✅ Created notifications trigger');
      } catch (error) {
        console.log(`⚠️  Error creating notifications table: ${error.message}`);
        // Try to create table without foreign key constraints first
        try {
          await client.query(`
            CREATE TABLE notifications (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              type notification_type NOT NULL DEFAULT 'INTERVIEW_REMINDER',
              title VARCHAR(255) NOT NULL,
              message TEXT NOT NULL,
              status notification_status NOT NULL DEFAULT 'UNREAD',
              user_id UUID NOT NULL,
              event_id UUID,
              scheduled_at TIMESTAMP,
              created_at TIMESTAMP DEFAULT now(),
              updated_at TIMESTAMP DEFAULT now()
            )
          `);
          console.log('✅ Created notifications table (without foreign keys)');
        } catch (innerError) {
          console.log(
            `❌ Failed to create notifications table: ${innerError.message}`,
          );
        }
      }
    } else {
      console.log('✅ Notifications table already exists');
    }

    // Check if applied_at column is still DATE type and migrate to TIMESTAMP
    const { rows: appliedAtColumnInfo } = await client.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'applications' 
      AND column_name = 'applied_at' 
      AND table_schema = 'public'
    `);

    if (appliedAtColumnInfo[0] && appliedAtColumnInfo[0].data_type === 'date') {
      console.log('🔄 Migrating applied_at column from DATE to TIMESTAMP');

      try {
        await client.query('BEGIN');

        // Step 1: Drop the dependent view
        console.log('📋 Dropping dependent view: user_applications_view');
        await client.query('DROP VIEW IF EXISTS user_applications_view');

        // Step 2: Add temporary column
        console.log('📊 Adding temporary timestamp column');
        await client.query(
          'ALTER TABLE applications ADD COLUMN applied_at_temp TIMESTAMP',
        );

        // Step 3: Copy existing data, setting time to noon to avoid timezone issues
        console.log('📝 Copying data to new column with timestamp');
        await client.query(`
          UPDATE applications 
          SET applied_at_temp = applied_at + INTERVAL '12 hours'
          WHERE applied_at IS NOT NULL
        `);

        // Step 4: Drop old column
        console.log('🗑️ Dropping old DATE column');
        await client.query('ALTER TABLE applications DROP COLUMN applied_at');

        // Step 5: Rename new column
        console.log('🔄 Renaming temporary column');
        await client.query(
          'ALTER TABLE applications RENAME COLUMN applied_at_temp TO applied_at',
        );

        // Step 6: Recreate the view with TIMESTAMP type
        console.log('📋 Recreating user_applications_view with TIMESTAMP');
        await client.query(`
          CREATE VIEW user_applications_view AS
          SELECT 
            a.id,
            a.position,
            a.status,
            a.applied_at,
            a.salary,
            a.location,
            a.remote,
            c.name AS company_name,
            c.website AS company_website,
            u.first_name,
            u.last_name,
            u.email
          FROM applications a
          JOIN companies c ON a.company_id = c.id
          JOIN users u ON a.user_id = u.id
        `);

        await client.query('COMMIT');
        console.log('✅ Successfully migrated applied_at to TIMESTAMP');
      } catch (migrationError) {
        await client.query('ROLLBACK');
        console.error(
          '❌ Failed to migrate applied_at column:',
          migrationError.message,
        );
        throw migrationError;
      }
    } else {
      console.log('✅ Applied_at column is already TIMESTAMP type');
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
