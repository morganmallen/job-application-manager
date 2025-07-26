-- =====================================================
-- COMPLETE DATABASE SCHEMA FOR JOB APPLICATION MANAGER
-- =====================================================

-- ENUM TYPES
CREATE TYPE application_status AS ENUM (
  'Applied',
  'Withdraw', 
  'In progress',
  'Rejected',
  'Accepted',
  'Job Offered'
);

CREATE TYPE work_setup AS ENUM (
  'Onsite',
  'Hybrid',
  'Remote'
);

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
);

-- =====================================================
-- CORE BUSINESS TABLES
-- =====================================================

-- USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- COMPANIES TABLE
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  description TEXT,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- JOB APPLICATIONS TABLE
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position VARCHAR(255) NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status application_status DEFAULT 'Applied',
  applied_at DATE,
  salary VARCHAR(255),
  location VARCHAR(255),
  remote BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- APPLICATION EVENTS TABLE
CREATE TABLE application_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  type event_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- NOTES TABLE (from original design)
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- =====================================================
-- AUTHENTICATION & SECURITY TABLES
-- =====================================================

-- REFRESH TOKENS TABLE
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  user_agent TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT now()
);

-- TOKEN BLACKLIST TABLE
CREATE TABLE token_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Companies indexes
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_name ON companies(name);

-- Applications indexes
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_company_id ON applications(company_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at);

-- Application events indexes
CREATE INDEX idx_application_events_application_id ON application_events(application_id);
CREATE INDEX idx_application_events_type ON application_events(type);
CREATE INDEX idx_application_events_scheduled_at ON application_events(scheduled_at);

-- Notes indexes
CREATE INDEX idx_notes_application_id ON notes(application_id);
CREATE INDEX idx_notes_created_at ON notes(created_at);

-- Refresh tokens indexes
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_is_revoked ON refresh_tokens(is_revoked);

-- Token blacklist indexes
CREATE INDEX idx_token_blacklist_token_hash ON token_blacklist(token_hash);
CREATE INDEX idx_token_blacklist_expires_at ON token_blacklist(expires_at);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_events_updated_at BEFORE UPDATE ON application_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert sample user
INSERT INTO users (first_name, last_name, email, password_hash) VALUES
('John', 'Doe', 'john.doe@example.com', '$2b$10$example.hash.here');

-- Insert sample companies
INSERT INTO companies (name, website, description, location, user_id) VALUES
('TechCorp', 'https://techcorp.com', 'A leading technology company', 'San Francisco, CA', 
 (SELECT id FROM users WHERE email = 'john.doe@example.com')),
('StartupXYZ', 'https://startupxyz.com', 'An innovative startup', 'New York, NY',
 (SELECT id FROM users WHERE email = 'john.doe@example.com'));

-- Insert sample applications
INSERT INTO applications (position, company_id, user_id, status, applied_at, salary, location, remote) VALUES
('Senior Software Engineer', 
 (SELECT id FROM companies WHERE name = 'TechCorp'),
 (SELECT id FROM users WHERE email = 'john.doe@example.com'),
 'In progress', '2024-01-15', '$120,000 - $150,000', 'San Francisco, CA', FALSE),
('Full Stack Developer',
 (SELECT id FROM companies WHERE name = 'StartupXYZ'),
 (SELECT id FROM users WHERE email = 'john.doe@example.com'),
 'Applied', '2024-01-20', '$90,000 - $110,000', 'New York, NY', TRUE);

-- =====================================================
-- CLEANUP FUNCTION FOR EXPIRED TOKENS
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    -- Clean up expired refresh tokens
    DELETE FROM refresh_tokens WHERE expires_at < now();
    
    -- Clean up expired blacklisted tokens
    DELETE FROM token_blacklist WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for user applications with company info
CREATE VIEW user_applications_view AS
SELECT 
    a.id,
    a.position,
    a.status,
    a.applied_at,
    a.salary,
    a.location,
    a.remote,
    c.name as company_name,
    c.website as company_website,
    u.first_name,
    u.last_name,
    u.email
FROM applications a
JOIN companies c ON a.company_id = c.id
JOIN users u ON a.user_id = u.id;

-- View for application events with details
CREATE VIEW application_events_view AS
SELECT 
    ae.id,
    ae.type,
    ae.title,
    ae.description,
    ae.scheduled_at,
    ae.completed_at,
    a.position,
    c.name as company_name,
    u.first_name,
    u.last_name
FROM application_events ae
JOIN applications a ON ae.application_id = a.id
JOIN companies c ON a.company_id = c.id
JOIN users u ON a.user_id = u.id;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'User accounts for the job application manager';
COMMENT ON TABLE companies IS 'Companies where users have applied for jobs';
COMMENT ON TABLE applications IS 'Job applications submitted by users';
COMMENT ON TABLE application_events IS 'Events/interviews related to job applications';
COMMENT ON TABLE notes IS 'Notes added to job applications';
COMMENT ON TABLE refresh_tokens IS 'Refresh tokens for JWT authentication';
COMMENT ON TABLE token_blacklist IS 'Blacklisted/revoked JWT tokens';

COMMENT ON COLUMN users.id IS 'Unique user identifier (UUID)';
COMMENT ON COLUMN companies.user_id IS 'User who owns this company record';
COMMENT ON COLUMN applications.user_id IS 'User who submitted this application';
COMMENT ON COLUMN applications.company_id IS 'Company where the application was submitted';
COMMENT ON COLUMN application_events.application_id IS 'Application this event belongs to';
COMMENT ON COLUMN notes.application_id IS 'Application this note belongs to';
COMMENT ON COLUMN refresh_tokens.user_id IS 'User who owns this refresh token';
COMMENT ON COLUMN refresh_tokens.token_hash IS 'SHA-256 hash of the refresh token';
COMMENT ON COLUMN token_blacklist.token_hash IS 'SHA-256 hash of the blacklisted token'; 