#!/bin/bash

# Job Application Manager - Local Development Deployment Script
# This script sets up the database and starts the server for local development

set -e  # Exit on any error

echo "🚀 Starting Job Application Manager Local Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="jobapp_db"
DB_USER=$(whoami)
DB_HOST="localhost"
DB_PORT="5432"
SERVER_PORT="3001"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PostgreSQL is installed
check_postgres() {
    print_status "Checking PostgreSQL installation..."
    
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL is not installed!"
        echo "Please install PostgreSQL first:"
        echo "  macOS: brew install postgresql"
        echo "  Ubuntu: sudo apt-get install postgresql postgresql-contrib"
        echo "  Windows: Download from https://www.postgresql.org/download/windows/"
        exit 1
    fi
    
    print_success "PostgreSQL is installed"
}

# Check if PostgreSQL service is running
check_postgres_service() {
    print_status "Checking PostgreSQL service..."
    
    if ! pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; then
        print_warning "PostgreSQL service is not running. Attempting to start..."
        
        # Try to start PostgreSQL (macOS with Homebrew)
        if command -v brew &> /dev/null; then
            brew services start postgresql
            sleep 3
        else
            print_error "Please start PostgreSQL service manually"
            exit 1
        fi
    fi
    
    print_success "PostgreSQL service is running"
}

# Create database if it doesn't exist
create_database() {
    print_status "Checking database '$DB_NAME'..."
    
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        print_success "Database '$DB_NAME' already exists"
    else
        print_status "Creating database '$DB_NAME'..."
        createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
        print_success "Database '$DB_NAME' created successfully"
    fi
}

# Run database schema
setup_database() {
    print_status "Setting up database schema..."
    
    if [ -f "../database/complete_schema.sql" ]; then
        print_status "Running complete schema..."
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ../database/complete_schema.sql
        print_success "Database schema applied successfully"
    else
        print_error "Schema file '../database/complete_schema.sql' not found!"
        exit 1
    fi
}

# Check environment file
check_environment() {
    print_status "Checking environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            print_warning "No .env file found. Creating from env.example..."
            cp env.example .env
            print_success "Created .env file from template"
            print_warning "Please update .env with your database credentials"
        else
            print_error "No .env file or env.example found!"
            exit 1
        fi
    else
        print_success "Environment file exists"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Dependencies installed"
    else
        print_status "Dependencies already installed"
    fi
}

# Build the application
build_application() {
    print_status "Building the application..."
    npm run build
    print_success "Application built successfully"
}

# Start the server
start_server() {
    print_status "Starting the server..."
    print_success "Server will be available at: http://localhost:$SERVER_PORT"
    print_success "API Documentation: http://localhost:$SERVER_PORT/api-docs"
    print_success "Health Check: http://localhost:$SERVER_PORT/api/health"
    echo ""
    print_status "Press Ctrl+C to stop the server"
    echo ""
    
    npm run start:dev
}

# Main deployment process
main() {
    echo "=========================================="
    echo "  Job Application Manager - Local Deploy"
    echo "=========================================="
    echo ""
    
    check_postgres
    check_postgres_service
    create_database
    setup_database
    check_environment
    install_dependencies
    build_application
    
    echo ""
    print_success "Local deployment completed successfully!"
    echo ""
    
    start_server
}

# Run main function
main "$@" 