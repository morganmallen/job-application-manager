-- =====================================================
-- ADD NOTIFICATIONS TABLE MIGRATION
-- =====================================================

-- Create notification type enum
CREATE TYPE notification_type AS ENUM (
  'INTERVIEW_REMINDER',
  'APPLICATION_UPDATE',
  'SYSTEM'
);

-- Create notification status enum
CREATE TYPE notification_status AS ENUM (
  'UNREAD',
  'READ'
);

-- Create notifications table
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
);

-- Create indexes for notifications table
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_event_id ON notifications(event_id);

-- Create trigger for updated_at column
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE notifications IS 'User notifications for interview reminders and application updates';
COMMENT ON COLUMN notifications.user_id IS 'User who owns this notification';
COMMENT ON COLUMN notifications.event_id IS 'Related application event (optional)';
COMMENT ON COLUMN notifications.scheduled_at IS 'Scheduled date for the related event'; 