# VDO ERP Frontend - Production Deployment Guide

This comprehensive guide provides step-by-step instructions for deploying the VDO ERP frontend to production servers.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Building for Production](#building-for-production)
4. [Deployment Methods](#deployment-methods)
5. [SSL/HTTPS Setup](#sslhttps-setup)
6. [Post-Deployment Tasks](#post-deployment-tasks)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to production, ensure you have completed these steps:

- [ ] **Install Dependencies**: Run `npm install` to ensure all dependencies (including Express) are installed
- [ ] **Update Environment Variables**: Configure `.env.production` with production API URLs
- [ ] **Update Meta Tags**: Ensure `index.html` has correct domain URLs in og:url and twitter:url
- [ ] **Test Production Build**: Build and test locally using `npm run build && npm run preview`
- [ ] **Code Review**: Review code (console.logs will be automatically removed during build)
- [ ] **Backend Ready**: Ensure Laravel backend is deployed and accessible
- [ ] **CORS Configuration**: Ensure backend CORS settings allow production frontend domain

---

## Environment Configuration

### Step 1: Configure Production Environment Variables

Edit `.env.production` file (already created):

```env
# IMPORTANT: Update these values for your production server
VITE_API_URL=https://api.yourdomain.com/api
VITE_BACKEND_URL=https://api.yourdomain.com
VITE_APP_ENV=production
VITE_API_VERSION=v1
```

**Replace `yourdomain.com` with your actual domain.**

### Step 2: Update index.html

Edit `index.html` and update these meta tags (lines 15, 21):

```html
<meta property="og:url" content="https://yourdomain.com/" />
<meta property="twitter:url" content="https://yourdomain.com/" />
```

**Replace `yourdomain.com` with your actual domain.**

---

## Building for Production

### Step 1: Install Dependencies

```bash
cd "c:\Users\Rahmani\Desktop\ERP\vdo erp\front"
npm install
```

This will install all dependencies including:
- Express (for Node.js server deployment)
- All React dependencies
- Build tools

### Step 2: Build the Application

```bash
npm run build
```

**What this does:**
- ✅ Creates optimized production build in `/dist` folder
- ✅ Removes all `console.log` statements automatically
- ✅ Minifies code and assets for faster loading
- ✅ Splits code into chunks (vendor, ui, utils) for better caching
- ✅ Generates hashed filenames for cache busting
- ✅ Organizes assets into folders (images, fonts, js, css)
- ✅ Copies routing config files (.htaccess, _redirects, web.config) to dist

### Step 3: Test Production Build Locally

```bash
npm run preview
```

This starts a local server on http://localhost:3000 to test the production build.

**Verify these work:**
- ✅ Navigate to http://localhost:3000
- ✅ Test all routes (click through sidebar menu)
- ✅ Test deep links directly in browser (e.g., http://localhost:3000/programm/work-plans)
- ✅ Verify no console errors
- ✅ Test dark mode toggle
- ✅ Test CRUD operations (create, read, update, delete)
- ✅ Verify IndexedDB works (check DevTools → Application → IndexedDB)

---

## Deployment Methods

Choose the deployment method that matches your server environment:

### Method 1: Node.js/Express Server (Recommended for VPS)

**Best for:** VPS, dedicated servers, cloud platforms (AWS EC2, DigitalOcean, Linode)

#### Step 1: Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 or higher)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
```

#### Step 2: Upload Build Files

**Option A: Using Git (Recommended)**
```bash
# On server
cd /var/www
sudo git clone https://your-repo-url.git vdo-erp
cd vdo-erp
sudo npm install
sudo npm run build
```

**Option B: Direct Upload**
```bash
# On your local machine
npm run build

# Upload to server (adjust paths as needed)
scp -r dist/ package.json server.js user@yourserver:/var/www/vdo-erp/
```

#### Step 3: Install Express on Server

```bash
cd /var/www/vdo-erp
sudo npm install express
```

#### Step 4: Start Server with PM2 (Production Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application
pm2 start server.js --name vdo-erp-frontend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the command PM2 provides (usually starts with 'sudo env...')

# Check status
pm2 status

# View real-time logs
pm2 logs vdo-erp-frontend

# Monitor performance
pm2 monit
```

**PM2 Useful Commands:**
```bash
pm2 restart vdo-erp-frontend  # Restart app
pm2 stop vdo-erp-frontend     # Stop app
pm2 delete vdo-erp-frontend   # Remove from PM2
pm2 list                      # List all apps
```

#### Step 5: Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000  # Port used by Express server
sudo ufw enable
sudo ufw status
```

#### Step 6: Setup Nginx Reverse Proxy (Recommended)

Install Nginx:
```bash
sudo apt install nginx -y
```

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/vdo-erp
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
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
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/vdo-erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### Method 2: Nginx Direct Serving (Static Files)

**Best for:** VPS with Nginx, better performance for static sites

#### Step 1: Install Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

#### Step 2: Upload Build Files

```bash
# Build locally
npm run build

# Create directory on server
sudo mkdir -p /var/www/vdo-erp

# Upload dist folder contents (not the dist folder itself)
scp -r dist/* user@yourserver:/tmp/vdo-erp/
# Then on server:
sudo mv /tmp/vdo-erp/* /var/www/vdo-erp/
```

#### Step 3: Use Provided Nginx Configuration

The `nginx.conf` file is already created. Copy it to server:

```bash
# On local machine
scp nginx.conf user@yourserver:/tmp/

# On server
sudo cp /tmp/nginx.conf /etc/nginx/sites-available/vdo-erp
sudo nano /etc/nginx/sites-available/vdo-erp
```

**IMPORTANT: Update in the file:**
- Line 8: Replace `yourdomain.com` with your actual domain
- Line 12: Verify root path is `/var/www/vdo-erp`

#### Step 4: Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/vdo-erp /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

#### Step 5: Set Permissions

```bash
sudo chown -R www-data:www-data /var/www/vdo-erp
sudo chmod -R 755 /var/www/vdo-erp
```

---

### Method 3: Apache Server (cPanel, Shared Hosting)

**Best for:** Shared hosting, cPanel servers

#### Step 1: Build Application Locally

```bash
npm run build
```

#### Step 2: Upload Files

1. Open your hosting file manager or FTP client
2. Navigate to `public_html/` (or your web root)
3. Upload **ALL files and folders** from the `dist/` folder
   - ✅ Upload `index.html`
   - ✅ Upload `assets/` folder
   - ✅ Upload `.htaccess` file (very important!)
   - ✅ Upload `vite.svg` and other public assets

#### Step 3: Verify .htaccess Exists

The `.htaccess` file from `public/` folder is automatically copied to `dist/` during build.

**Verify it exists in your web root:**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

#### Step 4: Enable mod_rewrite (if you have server access)

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

If you don't have server access, contact your hosting provider to enable mod_rewrite.

---

### Method 4: Netlify (Quick & Free)

**Best for:** Quick deployment, free hosting for frontend

#### Step 1: Create Netlify Account

Go to https://netlify.com and create an account.

#### Step 2: Deploy via Git

1. Push your code to GitHub/GitLab/Bitbucket
2. In Netlify dashboard: **New site from Git**
3. Select your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18
5. Click **Deploy site**

#### Step 3: Configure Environment Variables

In Netlify dashboard:
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **Edit variables**
3. Add these environment variables:
   - `VITE_API_URL`: `https://api.yourdomain.com/api`
   - `VITE_BACKEND_URL`: `https://api.yourdomain.com`
   - `VITE_APP_ENV`: `production`
   - `VITE_API_VERSION`: `v1`

#### Step 4: Configure Custom Domain

1. Go to **Domain settings** → **Add custom domain**
2. Follow DNS configuration instructions
3. HTTPS is automatically enabled by Netlify

**Note:** The `_redirects` file in `public/` folder is automatically used by Netlify.

---

### Method 5: Vercel (Serverless)

**Best for:** Quick deployment, serverless hosting

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Deploy

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

Follow the prompts:
- Setup and deploy: Yes
- Which scope: Your account
- Link to existing project: No
- Project name: vdo-erp
- In which directory: ./
- Override settings: No

#### Step 3: Set Environment Variables

```bash
vercel env add VITE_API_URL production
# Enter: https://api.yourdomain.com/api

vercel env add VITE_BACKEND_URL production
# Enter: https://api.yourdomain.com

vercel env add VITE_APP_ENV production
# Enter: production
```

Then redeploy:
```bash
vercel --prod
```

---

## SSL/HTTPS Setup

### Option 1: Let's Encrypt (Free SSL Certificate)

**For Nginx:**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate (replace yourdomain.com)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose redirect HTTP to HTTPS: Yes (option 2)

# Test auto-renewal
sudo certbot renew --dry-run

# Certificates auto-renew every 90 days
```

**For Apache:**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache -y

# Obtain SSL certificate
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com
```

### Option 2: Cloudflare (Free SSL + CDN + DDoS Protection)

1. Sign up at https://cloudflare.com
2. Add your domain
3. Change your domain's nameservers to Cloudflare's (provided in dashboard)
4. Wait for nameserver change (can take 24-48 hours)
5. In Cloudflare dashboard:
   - **SSL/TLS** → Set to **Full** or **Full (strict)**
   - **SSL/TLS** → **Edge Certificates** → Enable **Always Use HTTPS**
   - **Speed** → **Optimization** → Enable **Auto Minify** for HTML, CSS, JS

---

## Post-Deployment Tasks

### 1. Verify Deployment Checklist

Test these URLs (replace with your domain):

- [ ] `https://yourdomain.com/` - Homepage loads
- [ ] `https://yourdomain.com/hr/employees` - Deep link works (not 404)
- [ ] `https://yourdomain.com/programm/work-plans` - Another deep link works
- [ ] `https://yourdomain.com/finance/projects` - Finance module loads
- [ ] Hard refresh (Ctrl+Shift+R) - Page still works

### 2. Test Full Functionality

- [ ] Login works (if authentication implemented)
- [ ] API calls succeed and return data
- [ ] CRUD operations work (Create, Read, Update, Delete)
- [ ] Dark mode toggles correctly
- [ ] All sidebar menu items accessible
- [ ] IndexedDB working (check DevTools → Application → IndexedDB)
- [ ] Forms submit correctly
- [ ] Data persists after page refresh

### 3. Performance Check

Test site performance:
- **Google PageSpeed Insights**: https://pagespeed.web.dev/
- **GTmetrix**: https://gtmetrix.com/
- **WebPageTest**: https://www.webpagetest.org/

**Target Metrics:**
- Performance score: > 90
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s

### 4. Setup Monitoring (Optional but Recommended)

**Uptime Monitoring:**
- UptimeRobot: https://uptimerobot.com/ (free)
- Pingdom: https://www.pingdom.com/

**Error Tracking (Sentry):**

```bash
npm install @sentry/react @sentry/vite-plugin
```

Add to `src/main.jsx`:

```javascript
import * as Sentry from "@sentry/react";

if (import.meta.env.VITE_APP_ENV === 'production') {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV,
    integrations: [new Sentry.BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}
```

### 5. Backup Strategy

Create automated backups:

```bash
#!/bin/bash
# backup-vdo-erp.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/vdo-erp"
SOURCE_DIR="/var/www/vdo-erp"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Create backup
tar -czf $BACKUP_DIR/vdo-erp-$DATE.tar.gz $SOURCE_DIR

# Keep only last 30 days of backups
find $BACKUP_DIR -name "vdo-erp-*.tar.gz" -mtime +30 -delete

echo "Backup completed: vdo-erp-$DATE.tar.gz"
```

Make executable and schedule:
```bash
chmod +x backup-vdo-erp.sh

# Add to crontab (daily backup at 2 AM)
crontab -e
# Add line:
0 2 * * * /path/to/backup-vdo-erp.sh
```

---

## Troubleshooting

### Issue: Routes Return 404 Errors

**Symptoms:** Clicking links works, but refreshing page or direct URL access shows 404.

**Cause:** Server not configured to handle client-side routing.

**Solutions:**

- **Nginx:**
  - Verify `try_files $uri $uri/ /index.html;` exists in location block
  - Run `sudo nginx -t` to test config
  - Check `/var/log/nginx/error.log`

- **Apache:**
  - Ensure `.htaccess` file exists in web root
  - Verify `mod_rewrite` is enabled: `apache2ctl -M | grep rewrite`
  - Check file permissions: `chmod 644 .htaccess`

- **Node/Express:**
  - Verify `server.js` has `app.get('*')` route
  - Check PM2 logs: `pm2 logs vdo-erp-frontend`

### Issue: Blank White Page After Deployment

**Symptoms:** Page loads but shows only white screen.

**Cause:** JavaScript errors, incorrect base path, or assets not loading.

**Solutions:**

1. **Check browser console** (F12 → Console tab)
   - Look for JavaScript errors
   - Check for "Failed to load resource" errors

2. **Verify assets path:**
   - In `vite.config.js`, ensure `base` option is not set (or set to `/`)
   - If deploying to subdirectory (e.g., `yourdomain.com/app`), set `base: '/app/'`

3. **Hard refresh browser:**
   - Chrome/Firefox: `Ctrl + Shift + R`
   - Safari: `Cmd + Shift + R`

4. **Clear browser cache:**
   - Chrome: Settings → Privacy → Clear browsing data
   - Or use incognito mode to test

5. **Check file uploads:**
   - Ensure ALL files from `dist/` folder were uploaded
   - Verify `index.html` exists in web root
   - Check `assets/` folder exists with all files

### Issue: API Calls Fail / CORS Errors

**Symptoms:** Console shows CORS errors or API requests fail with 403/401.

**Cause:** Backend CORS not configured or incorrect API URL.

**Solutions:**

1. **Verify environment variables:**
   ```bash
   # Check .env.production exists and has correct URLs
   cat .env.production
   ```

2. **Configure Laravel CORS** (`config/cors.php`):
   ```php
   'allowed_origins' => [
       'https://yourdomain.com',
       'https://www.yourdomain.com',
   ],
   'allowed_origins_patterns' => [],
   'allowed_methods' => ['*'],
   'allowed_headers' => ['*'],
   'supports_credentials' => true,
   ```

3. **Check Laravel .env:**
   ```env
   SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
   SESSION_DOMAIN=.yourdomain.com
   ```

4. **Test API directly:**
   - Visit `https://api.yourdomain.com/api/health` in browser
   - Should return JSON response, not 404

### Issue: Environment Variables Not Working

**Symptoms:** App uses development URLs in production.

**Cause:** Environment variables not loaded during build.

**Solutions:**

1. **Ensure .env.production exists:**
   ```bash
   ls -la .env.production
   ```

2. **Rebuild with production env:**
   ```bash
   npm run build
   ```
   Vite automatically loads `.env.production` during build

3. **Environment variables MUST start with `VITE_`:**
   ```env
   ✅ VITE_API_URL=...
   ❌ API_URL=...  (won't work)
   ```

4. **Access in code:**
   ```javascript
   ✅ import.meta.env.VITE_API_URL
   ❌ process.env.VITE_API_URL  (Node.js style, won't work in Vite)
   ```

### Issue: Large Bundle Size / Slow Loading

**Symptoms:** Initial page load is very slow.

**Cause:** JavaScript bundle too large.

**Solutions:**

Already configured in `vite.config.js`:
- ✅ Code splitting (vendor, ui, utils chunks)
- ✅ Minification with Terser
- ✅ CSS code splitting
- ✅ Console.log removal

Additional optimizations:

1. **Enable gzip on server** (already in nginx.conf)

2. **Use dynamic imports for large components:**
   ```javascript
   const HeavyComponent = lazy(() => import('./HeavyComponent'));
   ```

3. **Analyze bundle:**
   ```bash
   npm run build -- --mode analyze
   ```

### Issue: Permissions Errors (Linux Servers)

**Symptoms:** 403 Forbidden or file not found errors.

**Cause:** Incorrect file permissions or ownership.

**Solutions:**

```bash
# For Nginx
sudo chown -R www-data:www-data /var/www/vdo-erp
sudo chmod -R 755 /var/www/vdo-erp
sudo chmod 644 /var/www/vdo-erp/index.html

# For Apache
sudo chown -R www-data:www-data /var/www/vdo-erp
sudo chmod -R 755 /var/www/vdo-erp

# Verify
ls -la /var/www/vdo-erp
```

### Issue: PM2 App Won't Start

**Symptoms:** PM2 shows app as stopped or errored.

**Cause:** Port already in use or missing dependencies.

**Solutions:**

```bash
# Check PM2 logs
pm2 logs vdo-erp-frontend --lines 100

# Check if port 3000 is in use
sudo lsof -i :3000

# Kill process using port (if needed)
sudo kill -9 <PID>

# Verify Express is installed
cd /var/www/vdo-erp
npm list express

# Reinstall if needed
npm install express

# Restart PM2
pm2 restart vdo-erp-frontend
```

---

## Update Deployment (After Code Changes)

When deploying updates:

### Method 1: Git (Recommended)

```bash
# On server
cd /var/www/vdo-erp
git pull origin main
npm install  # Install any new dependencies
npm run build

# For PM2
pm2 restart vdo-erp-frontend

# For Nginx (no restart needed, files auto-updated)
# Just verify
curl -I https://yourdomain.com
```

### Method 2: Manual Upload

```bash
# On local machine
npm run build

# Upload new dist files
scp -r dist/* user@yourserver:/tmp/vdo-erp-new/

# On server
sudo rm -rf /var/www/vdo-erp/*
sudo mv /tmp/vdo-erp-new/* /var/www/vdo-erp/
sudo chown -R www-data:www-data /var/www/vdo-erp

# For PM2
pm2 restart vdo-erp-frontend
```

### Rollback if Deployment Fails

```bash
# With Git
git revert HEAD
git push origin main
# Then redeploy

# With backups
cd /var/www
sudo mv vdo-erp vdo-erp-failed
sudo tar -xzf /backups/vdo-erp/vdo-erp-YYYYMMDD_HHMMSS.tar.gz
pm2 restart vdo-erp-frontend
```

---

## Performance Optimization

### Already Configured

✅ **Code Splitting** - Vendor, UI, and Utils separated
✅ **Minification** - Terser minification enabled
✅ **Console Removal** - All console.log removed in production
✅ **Asset Hashing** - Cache busting with hashed filenames
✅ **CSS Splitting** - CSS code split per component
✅ **Gzip Compression** - Configured in nginx.conf

### Additional Recommendations

1. **Use CDN for Assets:**
   - Cloudflare (free)
   - AWS CloudFront
   - Azure CDN

2. **Enable HTTP/2:**
   Nginx (automatic with SSL):
   ```nginx
   listen 443 ssl http2;
   ```

3. **Lazy Load Routes:**
   ```javascript
   const ProgramWorkPlanList = lazy(() => import('./pages/programm/ProgramWorkPlanList'));
   ```

4. **Preload Critical Resources:**
   Add to `index.html`:
   ```html
   <link rel="preload" href="/assets/vendor-hash.js" as="script">
   ```

---

## Security Best Practices

### Already Implemented

✅ **Security Headers** - X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
✅ **CSP** - Content Security Policy in index.html
✅ **HTTPS Upgrade** - upgrade-insecure-requests meta tag

### Additional Security

1. **Keep Dependencies Updated:**
   ```bash
   npm audit
   npm audit fix
   npm outdated
   npm update
   ```

2. **Environment Variables:**
   - ❌ Never commit `.env.production` with real credentials to Git
   - ✅ Use server environment variables for sensitive data
   - ✅ Add to `.gitignore`:
     ```
     .env.production
     .env.local
     ```

3. **Rate Limiting** (on backend):
   Laravel already has rate limiting middleware

4. **Regular Backups:**
   Schedule automated backups (see Backup Strategy section)

5. **Monitor Logs:**
   ```bash
   # Nginx
   tail -f /var/log/nginx/vdo-erp-error.log

   # PM2
   pm2 logs vdo-erp-frontend
   ```

---

## Quick Reference Commands

### Development
```bash
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Build for production
npm run preview    # Preview production build (http://localhost:3000)
npm run lint       # Lint code
```

### Production (PM2)
```bash
pm2 start server.js --name vdo-erp-frontend
pm2 stop vdo-erp-frontend
pm2 restart vdo-erp-frontend
pm2 logs vdo-erp-frontend
pm2 monit
pm2 save
pm2 startup
```

### Nginx
```bash
sudo nginx -t                          # Test config
sudo systemctl reload nginx            # Reload config
sudo systemctl restart nginx           # Restart service
tail -f /var/log/nginx/error.log       # View error log
```

### SSL (Let's Encrypt)
```bash
sudo certbot --nginx -d yourdomain.com         # Get certificate
sudo certbot renew --dry-run                   # Test renewal
sudo systemctl status certbot.timer            # Check auto-renewal
```

### Git
```bash
git pull origin main           # Pull latest changes
git status                     # Check status
git log --oneline -10          # View recent commits
```

---

## Final Deployment Checklist

Before marking deployment as complete:

- [ ] All environment variables configured
- [ ] Production build tested locally (`npm run preview`)
- [ ] Backend API accessible from frontend domain
- [ ] CORS configured correctly on backend
- [ ] DNS records configured (A record or CNAME)
- [ ] SSL certificate installed and working
- [ ] All routes tested (no 404 errors on refresh)
- [ ] All CRUD operations work correctly
- [ ] IndexedDB functioning properly
- [ ] Dark mode toggle works
- [ ] No console errors in production
- [ ] Performance score > 90 (PageSpeed Insights)
- [ ] Mobile responsive design verified
- [ ] Monitoring/logging setup (optional)
- [ ] Backup strategy implemented
- [ ] Team trained on update deployment process
- [ ] Documentation updated with production URLs

---

## Support & Resources

- **Vite Build Guide**: https://vitejs.dev/guide/build.html
- **React Router Deployment**: https://reactrouter.com/en/main/guides/deployment
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/getting-started/
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/usage/quick-start/
- **Cloudflare**: https://www.cloudflare.com/

---

## Deployment Information Template

Fill this out after deployment:

**Deployment Date:** _____________
**Deployed By:** _____________
**Production URL:** _____________
**Backend API URL:** _____________
**Hosting Provider:** _____________
**Deployment Method:** _____________
**SSL Provider:** _____________
**PM2 Process Name:** _____________
**Server IP:** _____________

**Notes:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---

*Last Updated: 2025-01-25*
*VDO ERP Frontend v1.0*
