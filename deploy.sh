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
mkdir -p /home/ygydipiy/public_html

# Copy frontend build to public_html
echo "Copying frontend build files..."
cp -r dist/* /home/ygydipiy/public_html/

# Create frontend .htaccess
echo "Creating frontend .htaccess..."
cat > /home/ygydipiy/public_html/.htaccess << 'EOL'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
EOL

# Backend Deployment
echo "Setting up backend..."
cd ../backend

# Create backend deployment directory if it doesn't exist
echo "Creating backend deployment directory..."
mkdir -p /home/ygydipiy/api.musikazw.com
mkdir -p /home/ygydipiy/api.musikazw.com/logs

# Install backend dependencies
echo "Installing backend dependencies..."
npm install --production

# Copy backend files
echo "Copying backend files..."
cp -r * /home/ygydipiy/api.musikazw.com/
cp .env.production /home/ygydipiy/api.musikazw.com/.env

# Install PM2 globally if not already installed
echo "Setting up PM2..."
npm install pm2 -g

# Start/Restart the backend application with PM2
echo "Starting backend application..."
cd /home/ygydipiy/api.musikazw.com
pm2 delete musika-backend 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save

echo "Deployment completed successfully!"
