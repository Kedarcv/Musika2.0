#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process..."

# Frontend Deployment
echo "Building frontend..."
cd frontend
npm install
npm run build

# Create frontend deployment directory if it doesn't exist
echo "Setting up frontend deployment..."
rm -rf /home/ygydipiy/public_html/main/*
mkdir -p /home/ygydipiy/public_html/main

# Copy frontend build to main directory
echo "Copying frontend build files..."
cp -r dist/* /home/ygydipiy/public_html/main/
cp dist/.htaccess /home/ygydipiy/public_html/main/

# Backend Deployment
echo "Setting up backend..."
cd ../backend

# Create backend deployment directory and logs directory if they don't exist
echo "Creating backend deployment directory..."
mkdir -p /home/ygydipiy/public_html/api.musikazw.com
mkdir -p /home/ygydipiy/public_html/api.musikazw.com/logs

# Install backend dependencies
echo "Installing backend dependencies..."
npm install --production

# Copy backend files
echo "Copying backend files..."
cp -r * /home/ygydipiy/public_html/api.musikazw.com/
cp .env.production /home/ygydipiy/public_html/api.musikazw.com/.env

# Install PM2 globally if not already installed
echo "Setting up PM2..."
npm install pm2 -g

# Start/Restart the backend application with PM2
echo "Starting backend application..."
cd /home/ygydipiy/public_html/api.musikazw.com
pm2 delete musika-backend 2>/dev/null || true
NODE_ENV=production pm2 start index.js --name musika-backend
pm2 save

echo "Deployment completed successfully!"
echo "Frontend: https://musikazw.com/main"
echo "Backend API: https://api.musikazw.com"
