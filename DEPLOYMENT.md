# Deployment Guide - Secure Document Vault

## Prerequisites
- Node.js 18+
- MongoDB Atlas account
- VPS (Ubuntu 22.04+)
- Domain name (optional)

## 1. MongoDB Atlas Setup
1. Create cluster at https://cloud.mongodb.com
2. Create database user (atlas admin)
3. Network access: add your VPS IP or `0.0.0.0/0`
4. Get connection string

## 2. Backend Setup

### Environment Variables
```bash
cd /opt/document-vault/backend
cp .env .env.production
# Edit .env.production:
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.xxxxx.mongodb.net/document-vault
JWT_SECRET=<generate: openssl rand -hex 64>
JWT_REFRESH_SECRET=<generate: openssl rand -hex 64>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
```

### Install & Build
```bash
npm install
npm run build  # compiles TypeScript -> dist/
```

### PM2 Process Manager
```bash
npm install -g pm2
pm2 start dist/server.js --name document-vault-api
pm2 save
pm2 startup  # restart on reboot
```

## 3. Frontend Build
```bash
cd /opt/document-vault/frontend
npm install
npm run build  # outputs to dist/
```

## 4. Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/document-vault
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Frontend static files
    root /opt/document-vault/frontend/dist;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript image/svg+xml;
    gzip_min_length 1000;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Increase timeouts for file uploads
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;

        # Increase body size for file uploads (50MB)
        client_max_body_size 60M;
    }

    # Security headers
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/document-vault /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 6. Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 7. Monitoring
```bash
pm2 monit              # real-time monitoring
pm2 logs document-vault-api  # view logs
pm2 status             # process status
```

## 8. Update Process
```bash
cd /opt/document-vault
git pull
cd backend && npm install && npm run build && pm2 restart document-vault-api
cd ../frontend && npm install && npm run build
```
