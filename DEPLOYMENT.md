# Deployment Guide for musikazw.com

## Prerequisites
1. cPanel access (https://myorderbox.co.zw:2083)
   - Username: ygydipiy
   - Password: Cvlised@360

2. Node.js and npm installed on the server
3. PM2 process manager
4. MongoDB installed and running

## Deployment Steps

### 1. Domain Setup in cPanel
1. Login to cPanel at https://myorderbox.co.zw:2083
2. Go to "Domains" section
3. Add subdomain "api.musikazw.com"
   - Document Root: /home/ygydipiy/api.musikazw.com

### 2. SSL Certificates
1. In cPanel, go to "SSL/TLS"
2. Install SSL certificates for:
   - musikazw.com
   - api.musikazw.com

### 3. Backend Deployment
1. Create the backend directory:
   ```bash
   mkdir -p /home/ygydipiy/api.musikazw.com
   ```

2. Copy the Apache configuration:
   ```bash
   sudo cp backend/api.musikazw.com.conf /etc/apache2/sites-available/
   sudo a2ensite api.musikazw.com.conf
   sudo systemctl reload apache2
   ```

3. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

### 4. Frontend Deployment
1. The frontend will be deployed to:
   ```
   /home/ygydipiy/public_html
   ```

### 5. Running the Deployment Script
1. Make the script executable:
   ```bash
   chmod +x deploy.sh
   ```

2. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

### 6. Post-Deployment Verification
1. Check if the frontend is accessible at https://musikazw.com
2. Verify the API is working at https://api.musikazw.com
3. Check PM2 status:
   ```bash
   pm2 status
   ```
4. Check logs:
   ```bash
   pm2 logs musika-backend
   ```

### 7. MongoDB Setup
1. Create the database:
   ```bash
   mongo
   use musika
   ```

2. Create indexes (automatically handled by the application on startup)

### 8. Troubleshooting
1. Check Apache error logs:
   ```bash
   sudo tail -f /var/log/apache2/api.musikazw.com_error.log
   ```

2. Check PM2 logs:
   ```bash
   pm2 logs musika-backend
   ```

3. Check application logs:
   ```bash
   tail -f /home/ygydipiy/api.musikazw.com/logs/combined.log
   ```

### 9. Maintenance
1. To update the application:
   ```bash
   ./deploy.sh
   ```

2. To restart the backend:
   ```bash
   pm2 restart musika-backend
   ```

3. To view backend status:
   ```bash
   pm2 status
   ```

### 10. Backup
1. Regular database backups:
   ```bash
   mongodump --db musika --out /home/ygydipiy/backups/$(date +%Y%m%d)
   ```

2. Application files backup:
   ```bash
   tar -czf /home/ygydipiy/backups/app_$(date +%Y%m%d).tar.gz /home/ygydipiy/api.musikazw.com /home/ygydipiy/public_html
   ```

## Security Notes
1. Ensure all environment variables are properly set
2. Keep MongoDB secure and regularly updated
3. Maintain SSL certificates
4. Regularly update npm packages
5. Monitor server logs for any suspicious activity

## Support
For any issues, check the application logs in:
- Backend: /home/ygydipiy/api.musikazw.com/logs/
- Apache: /var/log/apache2/
- PM2: pm2 logs
