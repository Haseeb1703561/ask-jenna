# 📝 Deployment Checklist

Use this checklist to track your deployment progress!

## 🔍 Step 1: Identify Your Hosting Type
- [ ] Log in to Hostinger hPanel
- [ ] Check your plan name
- [ ] Determine: Shared Hosting OR VPS/Cloud?

---

## For SHARED HOSTING:

### Backend (Vercel - FREE)
- [ ] Create Vercel account
- [ ] Create GitHub account (if needed)
- [ ] Upload code to GitHub
- [ ] Import repository to Vercel
- [ ] Add HEYGEN_API_KEY environment variable
- [ ] Deploy and save Vercel URL
- [ ] Test API: `https://YOUR-APP.vercel.app/api/health`

### Frontend (Hostinger)
- [ ] Update API URL in code (I'll help with this!)
- [ ] Run `npm run build:prod`
- [ ] Download FileZilla
- [ ] Get FTP credentials from Hostinger
- [ ] Upload `dist/` folder contents to `/public_html`
- [ ] Upload `.htaccess` file
- [ ] Visit your domain to test

---

## For VPS/CLOUD HOSTING:

### Server Setup
- [ ] Get VPS IP, username, password from hPanel
- [ ] Download PuTTY (or use PowerShell)
- [ ] Connect via SSH
- [ ] Update system: `apt update && apt upgrade -y`
- [ ] Install Node.js
- [ ] Install Nginx
- [ ] Install PM2

### Deploy Application
- [ ] Upload project to `/var/www/ask-jenna`
- [ ] Create `.env` file with HEYGEN_API_KEY
- [ ] Run `npm install`
- [ ] Run `npm run build:prod`
- [ ] Start with PM2: `pm2 start server/production.js --name ask-jenna`
- [ ] Save PM2: `pm2 save && pm2 startup`

### Configure Web Server
- [ ] Create Nginx config file
- [ ] Enable site in Nginx
- [ ] Test Nginx: `nginx -t`
- [ ] Reload Nginx: `systemctl reload nginx`
- [ ] Point domain A record to VPS IP
- [ ] Wait for DNS propagation (10-30 min)
- [ ] Install SSL: `certbot --nginx -d yourdomain.com`

### Final Testing
- [ ] Visit `https://yourdomain.com`
- [ ] Test Start Session button
- [ ] Check if avatar loads
- [ ] Test text chat
- [ ] Test voice chat

---

## 🆘 Stuck? Need Help?

Tell me:
1. Which hosting type you have
2. Which step you're stuck on
3. Any error messages you see

I'll help you fix it immediately!
