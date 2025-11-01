# Deploying Ask Jenna to Hostinger

This guide will walk you through deploying your HeyGen avatar app to Hostinger step by step.

## Prerequisites

Before starting, you need:
- Your Hostinger login credentials
- Your HeyGen API Key: `sk_V2_hgu_kFNPjI3dJH5_WCUdA1SPZEuoRR2fgTKoul2FgmkGhZTo`
- FileZilla or any FTP client installed on your computer

---

## Step 1: Check Your Hostinger Plan

First, log in to your Hostinger account and check what type of hosting you have:

### Option A: Shared Hosting (Most Common)
**Problem**: Shared hosting doesn't support Node.js servers easily.
**Solution**: You'll need to upgrade to VPS or use a different approach (static deployment).

### Option B: VPS or Cloud Hosting (Recommended)
**Good news**: This supports Node.js! Follow the VPS deployment guide below.

---

## FOR VPS/CLOUD HOSTING (Node.js Supported)

### Step 1: Build Your Application

On your local computer, open PowerShell in your project folder and run:

```bash
npm run build:prod
```

This creates a `dist` folder with your compiled React app.

### Step 2: Connect to Your VPS

1. Log in to Hostinger control panel (hPanel)
2. Go to **VPS** → **Overview**
3. Note your VPS IP address and SSH credentials

### Step 3: Upload Files via SSH/FTP

**Option A: Using FileZilla (Easier for beginners)**

1. Download FileZilla from: https://filezilla-project.org/
2. Open FileZilla and connect:
   - Host: Your VPS IP address
   - Username: root (or your VPS username)
   - Password: Your VPS password
   - Port: 22
3. Upload these folders/files to `/var/www/ask-jenna/`:
   - `dist/` folder
   - `server/` folder
   - `package.json`
   - `.env` (create this file with your HeyGen API key)

**Option B: Using SSH (Advanced)**

```bash
ssh root@YOUR_VPS_IP
cd /var/www
mkdir ask-jenna
cd ask-jenna
# Then upload files using SCP or git clone
```

### Step 4: Set Up Environment Variables

Create a `.env` file in your project root on the server:

```
HEYGEN_API_KEY=sk_V2_hgu_kFNPjI3dJH5_WCUdA1SPZEuoRR2fgTKoul2FgmkGhZTo
PORT=4000
NODE_ENV=production
```

### Step 5: Install Dependencies on VPS

Connect via SSH and run:

```bash
cd /var/www/ask-jenna
npm install --production
```

### Step 6: Install Node.js (if not installed)

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 7: Install PM2 (Process Manager)

PM2 keeps your app running even after you close SSH:

```bash
sudo npm install -g pm2
```

### Step 8: Start Your Application

```bash
cd /var/www/ask-jenna
pm2 start server/production.js --name "ask-jenna"
pm2 save
pm2 startup
```

### Step 9: Configure Nginx (Reverse Proxy)

Create Nginx config file:

```bash
sudo nano /etc/nginx/sites-available/ask-jenna
```

Paste this configuration (replace `your-domain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/ask-jenna /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 10: Point Your Domain

1. Go to Hostinger → **Domains** → **DNS/Nameservers**
2. Add an **A Record**:
   - Name: @ (or your subdomain)
   - Points to: Your VPS IP address
   - TTL: 14400

Wait 10-30 minutes for DNS to propagate.

### Step 11: Install SSL Certificate (HTTPS)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## FOR SHARED HOSTING (Alternative Approach)

If you only have shared hosting, you have two options:

### Option 1: Use Vercel for Backend API (Free)

Deploy your backend to Vercel (free) and frontend to Hostinger:

1. Create account at https://vercel.com
2. Install Vercel CLI: `npm i -g vercel`
3. Create `vercel.json` (I'll create this for you)
4. Deploy backend: `vercel --prod`
5. Update frontend to use Vercel API URL
6. Upload only the `dist` folder to Hostinger via FTP

### Option 2: Upgrade to Hostinger VPS

Hostinger VPS starts at ~$5/month and supports Node.js properly.

---

## Useful PM2 Commands (VPS)

```bash
pm2 status           # Check app status
pm2 logs ask-jenna   # View logs
pm2 restart ask-jenna # Restart app
pm2 stop ask-jenna    # Stop app
pm2 delete ask-jenna  # Remove app
```

---

## Troubleshooting

### Port Already in Use
```bash
pm2 delete all
sudo lsof -i :4000
sudo kill -9 <PID>
```

### App Not Starting
```bash
pm2 logs ask-jenna --lines 50
```

### Environment Variables Not Loading
Make sure `.env` is in the same directory as `server/production.js`

---

## Need Help?

Tell me:
1. What type of Hostinger hosting you have (VPS/Shared/Cloud)
2. Do you have a domain name already?
3. Any errors you're seeing

I'll guide you through each step!
