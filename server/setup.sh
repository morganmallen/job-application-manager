#!/bin/bash

echo "🚀 Setting up Job Application Manager Backend (NestJS)..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your database configuration before continuing."
    echo "   You need to set up a PostgreSQL database and update the DATABASE_URL."
    echo ""
    echo "   Example DATABASE_URL:"
    echo "   DATABASE_URL=\"postgresql://username:password@localhost:5432/job_application_manager\""
    echo ""
    read -p "Press Enter after you've configured your .env file..."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Make sure your PostgreSQL database is running"
echo "2. Update the DATABASE_URL in your .env file"
echo "3. Run: npm run start:dev (to start the development server)"
echo "4. Run: npm run seed (to add sample data)"
echo ""
echo "API Documentation will be available at: http://localhost:3001/api-docs" 