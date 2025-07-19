-- TABLE SCHEMA DESIGN --
Table: users
| Column         | Type         | Constraints     |
| -------------- | ------------ | --------------- |
| id             | SERIAL       | PRIMARY KEY     |
| first_name     | VARCHAR(100) | NOT NULL        |
| last_name      | VARCHAR(100) | NOT NULL        |
| email          | VARCHAR(255) | UNIQUE NOT NULL |
| password_hash  | VARCHAR(255) | NOT NULL        |
| created_at     | TIMESTAMP    | DEFAULT now()   |
| updated_at     | TIMESTAMP    | DEFAULT now()   |


Table: companies 
| Column      | Type         | Constraints   |
| ----------- | ------------ | ------------- |
| id          | SERIAL       | PRIMARY KEY   |
| name        | VARCHAR(255) | NOT NULL      |
| website     | VARCHAR(255) | NULL          |
| address     | TEXT         | NULL          |
| created_at  | TIMESTAMP    | DEFAULT now() |
| updated_at  | TIMESTAMP    | DEFAULT now() |


Table: job_applications
CREATE TYPE application_status AS ENUM ('Applied', 'Withdraw', 'In progress', 'Rejected', 'Accepted', 'Job Offered');
CREATE TYPE work_setup AS ENUM ('Onsite', 'Hybrid', 'Remote');

| Column           | Type                | Constraints                                 |
| ---------------- | ------------------- | ------------------------------------------- |
| id               | SERIAL              | PRIMARY KEY                                 |
| position         | VARCHAR(255)        | NOT NULL                                    |
| company_id       | INTEGER             | REFERENCES companies(id) ON DELETE SET NULL |
| user_id          | INTEGER             | REFERENCES users(id) ON DELETE CASCADE      |
| status           | application_status  | DEFAULT 'Applied'                           |
| applied_at       | DATE                | NULL                                        |
| salary           | NUMERIC(10,2)       | NULL                                        |
| work_setup       | work_setup          | NULL                                        |
| application_url  | VARCHAR(500)        | NULL                                        |
| created_at       | TIMESTAMP           | DEFAULT now()                               |
| updated_at       | TIMESTAMP           | DEFAULT now()                               |


Table: notes
| Column               | Type      | Constraints                                        |
| -------------------- | --------- | -------------------------------------------------- |
| id                   | SERIAL    | PRIMARY KEY                                        |
| job_application_id   | INTEGER   | REFERENCES job_applications(id) ON DELETE CASCADE  |
| content              | TEXT      | NOT NULL                                           |
| created_at           | TIMESTAMP | DEFAULT now()                                      |


-- Relationships
users has many job_applications
companies has many job_applications
job_applications can have many notes 


-- SCRIPTS -- 
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

-- USERS TABLE
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- COMPANIES TABLE
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- JOB APPLICATIONS TABLE
CREATE TABLE job_applications (
  id SERIAL PRIMARY KEY,
  position VARCHAR(255) NOT NULL,
  company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status application_status DEFAULT 'Applied',
  applied_at DATE,
  salary NUMERIC(10,2),
  work_setup work_setup,
  application_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- NOTES TABLE
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  job_application_id INTEGER REFERENCES job_applications(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
