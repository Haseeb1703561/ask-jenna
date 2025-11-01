# 🚀 Quick Hostinger Deployment Guide

## First, Tell Me Your Hosting Type

Log in to Hostinger and check your plan:

### How to Check:
1. Go to https://hpanel.hostinger.com
2. Look at your plan name in the dashboard

**Common Plans:**
- **"Premium Web Hosting"** / **"Business Hosting"** = Shared Hosting (⚠️ Needs workaround)
- **"VPS"** / **"Cloud"** = VPS/Cloud Hosting (✅ Full Node.js support)

---

## 📋 OPTION 1: Shared Hosting (Most Beginners Have This)

### The Challenge
Shared hosting doesn't run Node.js servers directly. But don't worry, we have a FREE solution!

### Solution: Split Deployment
- **Backend (API)** → Deploy to Vercel (100% FREE, takes 5 minutes)
- **Frontend (UI)** → Upload to Hostinger

### Step-by-Step:

#### Part A: Deploy Backend to Vercel (FREE)

1. **Create Vercel Account**
   - Go to https://vercel.com/signup
   - Sign up with GitHub (create GitHub account if you don't have one)

2. **Install Git & Upload Your Code**
   ```bash
   # In your project folder
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Push to GitHub**
   - Create a new repository on GitHub: https://github.com/new
   - Name it: `ask-jenna`
   - Run these commands:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ask-jenna.git
   git branch -M main
   git push -u origin main
   ```

4. **Deploy to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect and deploy
   - Add Environment Variable:
     - Name: `HEYGEN_API_KEY`
     - Value: `sk_V2_hgu_kFNPjI3dJH5_WCUdA1SPZEuoRR2fgTKoul2FgmkGhZTo`
   - Click "Deploy"
   - Save your deployment URL (e.g., `https://ask-jenna.vercel.app`)

#### Part B: Update Frontend for Vercel API

I'll update your code to use the Vercel API URL. Just tell me your Vercel URL when ready!

#### Part C: Upload Frontend to Hostinger

1. **Build Your Frontend**
   ```bash
   npm run build:prod
   ```

2. **Download FileZilla**
   - Get it from: https://filezilla-project.org/download.php?type=client

3. **Get Hostinger FTP Credentials**
   - Hostinger hPanel → **Files** → **FTP Accounts**
   - Note: Hostname, Username, Password, Port

4. **Connect & Upload**
   - Open FileZilla
   - Enter your FTP details
   - Navigate to `/public_html` on the right side
   - Drag all files from `dist/` folder to `/public_html`
   - Upload `.htaccess` file too

5. **Done!** Visit your domain: `http://yourdomain.com`

---

## 📋 OPTION 2: VPS/Cloud Hosting (Best for Full Control)

### You're Lucky! This is easier and better.

### Step 1: Access Your VPS

1. Go to Hostinger hPanel → **VPS**
2. Click **"Access VPS Panel"** or note your:
   - IP Address
   - SSH Username (usually `root`)
   - SSH Password

### Step 2: Connect via SSH

**Option A: Use PuTTY (Windows)**
1. Download PuTTY: https://www.putty.org/
2. Enter your VPS IP
3. Click "Open"
4. Login with username & password

**Option B: Use PowerShell (Windows 10+)**
```bash
ssh root@YOUR_VPS_IP
# Enter password when prompted
```

### Step 3: Prepare VPS

Once connected via SSH, run these commands one by one:

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Nginx
apt install -y nginx

# Install PM2
npm install -g pm2

# Check installations
node --version
npm --version
```

### Step 4: Upload Your Project

**Option A: Using Git (Easier)**
```bash
# On VPS
cd /var/www
git clone https://github.com/YOUR_USERNAME/ask-jenna.git
cd ask-jenna
npm install
```

**Option B: Using FileZilla**
1. Connect to VPS with SFTP (port 22)
2. Upload entire project folder to `/var/www/ask-jenna`

### Step 5: Configure Environment

```bash
cd /var/www/ask-jenna
nano .env
```

Add this:
```
HEYGEN_API_KEY=sk_V2_hgu_kFNPjI3dJH5_WCUdA1SPZEuoRR2fgTKoul2FgmkGhZTo
PORT=4000
NODE_ENV=production
```

Press `Ctrl+X`, then `Y`, then `Enter` to save.

### Step 6: Build & Start

```bash
npm run build:prod
pm2 start server/production.js --name ask-jenna
pm2 save
pm2 startup
```

Copy the command PM2 shows and run it.

### Step 7: Configure Nginx

```bash
nano /etc/nginx/sites-available/ask-jenna
```

Paste this (replace `your-domain.com`):

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
    }
}
```

Save and run:
```bash
ln -s /etc/nginx/sites-available/ask-jenna /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Step 8: Point Domain to VPS

1. Hostinger hPanel → **Domains** → Your domain → **DNS/Nameservers**
2. Add A Record:
   - Type: A
   - Name: @
   - Points to: Your VPS IP
   - TTL: 14400

### Step 9: Install SSL (HTTPS)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com -d www.your-domain.com
```

### ✅ Done! Visit `https://your-domain.com`

---

## 🆘 Which Option Should I Choose?

**Choose OPTION 1 (Vercel + Shared) if:**
- You have Hostinger Shared/Premium/Business hosting
- You want FREE deployment
- You're okay with separate backend (still works perfectly!)

**Choose OPTION 2 (VPS) if:**
- You have Hostinger VPS or Cloud hosting
- You want everything in one place
- You want more control

---

## 📞 Need Help?

Tell me:
1. **What's your Hostinger plan name?** (check hPanel dashboard)
2. **Do you have a domain connected already?**
3. **Do you have a GitHub account?**

I'll guide you through the exact steps for YOUR setup!
