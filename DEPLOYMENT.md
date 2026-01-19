# BookProof - Deployment Guide

## Hostinger Deployment Options

Hostinger offers several hosting types. Based on BookProof's architecture (NestJS + Next.js + PostgreSQL + Redis), here are your options:

### Option 1: Hostinger VPS (Recommended)

**Why VPS?** BookProof requires:
- Node.js runtime for NestJS backend
- Node.js runtime for Next.js frontend
- PostgreSQL database connection
- Redis for caching/queues
- Background job processing (BullMQ)

**Hostinger VPS Plans:**
- KVM 1: 1 vCPU, 4GB RAM (~$5.99/mo) - Minimum for testing
- KVM 2: 2 vCPU, 8GB RAM (~$10.99/mo) - Recommended for production

---

## VPS Deployment Setup

### 1. Initial VPS Setup

```bash
# Connect to your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Verify installation
node --version  # Should be v20.x
npm --version   # Should be v10.x

# Install PM2 (Process Manager)
npm install -g pm2

# Install Nginx (Reverse Proxy)
apt install -y nginx

# Install Git
apt install -y git
```

### 2. Database Setup (External - Recommended)

Use **Neon PostgreSQL** (free tier available):
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string

Use **Upstash Redis** (free tier available):
1. Go to https://upstash.com
2. Create a new Redis database
3. Copy the connection URL

### 3. Clone and Setup Project

```bash
# Create app directory
mkdir -p /var/www/bookproof
cd /var/www/bookproof

# Clone repository (or upload via SFTP)
git clone https://github.com/your-repo/bookproof.git .

# Install dependencies
npm install

# Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit environment files with production values
nano backend/.env
nano frontend/.env.local
```

### 4. Build Applications

```bash
# Generate Prisma client
cd backend
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build backend
npm run build

# Build frontend
cd ../frontend
npm run build
```

### 5. PM2 Configuration

Create `/var/www/bookproof/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'bookproof-backend',
      cwd: '/var/www/bookproof/backend',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    },
    {
      name: 'bookproof-frontend',
      cwd: '/var/www/bookproof/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

Start with PM2:
```bash
cd /var/www/bookproof
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Nginx Configuration

Create `/etc/nginx/sites-available/bookproof`:

```nginx
# Frontend (Main site)
server {
    listen 80;
    server_name bookproof.com www.bookproof.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.bookproof.com;

    # Increase client body size for file uploads
    client_max_body_size 500M;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout for large file uploads
        proxy_read_timeout 600s;
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/bookproof /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 7. SSL with Let's Encrypt

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificates
certbot --nginx -d bookproof.com -d www.bookproof.com -d api.bookproof.com

# Auto-renewal is configured automatically
```

---

## Environment Variables for Production

### Backend (.env)

```env
# Application
NODE_ENV=production
APP_NAME=BookProof
API_URL=https://api.bookproof.com
PORT=4000

# Database (Neon)
DATABASE_URL="postgresql://user:pass@host/bookproof?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:pass@host/bookproof?sslmode=require"

# JWT
JWT_SECRET=generate-a-64-char-random-string
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Cloudflare R2
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
R2_BUCKET=bookproof-files
R2_PUBLIC_BASE_URL=https://files.bookproof.com

# Email (Resend)
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@bookproof.com

# Redis (Upstash)
REDIS_URL=redis://default:xxxxx@xxxxx.upstash.io:6379

# CORS
CORS_ORIGIN=https://bookproof.com,https://www.bookproof.com

# Encryption Key (for payment details)
ENCRYPTION_KEY=generate-a-32-char-random-string
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_APP_URL=https://bookproof.com
NEXT_PUBLIC_API_URL=https://api.bookproof.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

---

## DNS Configuration

In Hostinger DNS settings, add:

| Type | Name | Value |
|------|------|-------|
| A | @ | YOUR_VPS_IP |
| A | www | YOUR_VPS_IP |
| A | api | YOUR_VPS_IP |

---

## Maintenance Commands

```bash
# View logs
pm2 logs bookproof-backend
pm2 logs bookproof-frontend

# Restart applications
pm2 restart all

# Update application
cd /var/www/bookproof
git pull
npm install
npm run build
pm2 restart all

# Database migrations
cd backend
npx prisma migrate deploy
```

---

## Option 2: Split Deployment (Alternative)

If VPS is not preferred, you can split the deployment:

| Component | Service | Free Tier |
|-----------|---------|-----------|
| Frontend | Vercel | Yes |
| Backend | Railway / Render | Yes (limited) |
| Database | Neon PostgreSQL | Yes |
| Redis | Upstash | Yes |
| Files | Cloudflare R2 | Yes (10GB) |

This approach may have more complexity but can be cheaper for low traffic.

---

## Security Checklist

- [ ] SSL certificates installed
- [ ] Firewall configured (UFW)
- [ ] SSH key authentication only
- [ ] Environment variables secured
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Stripe webhook secret verified
- [ ] Database connections use SSL

---

## Monitoring

1. **PM2 Monitoring**: `pm2 monit`
2. **Sentry**: Configure SENTRY_DSN for error tracking
3. **Uptime**: Use Hostinger's uptime monitoring or UptimeRobot

