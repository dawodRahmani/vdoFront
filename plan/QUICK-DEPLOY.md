# 🚀 Quick Deploy Guide - Fix 404 Errors

## Problem Summary
Your React app works locally but gives 404 errors on the server because:
- React Router handles routes on the client side
- Servers try to find physical files at routes like `/compliance/projects`
- Only `index.html` exists in your build

## ⚡ Quick Solutions

### If you're using:

#### 🔷 **Apache/cPanel/Shared Hosting**
✅ Already fixed! The `.htaccess` file is in `public/` folder

Just:
```bash
npm run build
```
Then upload the `dist/` folder contents to your server.

---

#### 🔷 **Nginx Server**
Add this to your Nginx config (`/etc/nginx/sites-available/default`):
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Then:
```bash
npm run build
sudo systemctl restart nginx
```

---

#### 🔷 **Node.js/Express Server**
Install express:
```bash
npm install express
```

Then run:
```bash
npm run start
```

This builds and serves your app on port 3000.

---

#### 🔷 **IIS (Windows Server)**
✅ Already fixed! The `web.config` file is in `public/` folder

Just:
```bash
npm run build
```
Upload `dist/` contents to IIS directory.

---

#### 🔷 **Vercel**
✅ Already configured! Just deploy:
```bash
npm run build
```
Push to GitHub and connect to Vercel.

---

#### 🔷 **Netlify**
✅ Already configured! Just deploy:
```bash
npm run build
```
Push to GitHub and connect to Netlify.

---

## 🧪 Test Before Deployment

1. Build locally:
```bash
npm run build
```

2. Test the production build:
```bash
npm run preview
```

3. Navigate to different routes and refresh - should work!

---

## 📋 Deployment Checklist

- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variables set (if any)
- [ ] API URLs updated for production
- [ ] Correct config file for your server
- [ ] Test all routes after deployment

---

## 🆘 Still Having Issues?

Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions for your specific hosting platform.

### Common Issues:

**Problem:** Still getting 404 on server
- ✅ Make sure config file is in the right place
- ✅ Restart your web server after config changes
- ✅ Clear browser cache (Ctrl+Shift+R)

**Problem:** Blank page
- ✅ Check browser console for errors
- ✅ Verify `base` path in `vite.config.js`
- ✅ Check file permissions (644 for files)

**Problem:** API not working
- ✅ Update `VITE_API_URL` in `.env`
- ✅ Check CORS settings on backend
- ✅ Verify API is accessible from production

---

## 📞 What Type of Server Are You Using?

Not sure? Run this command on your server:
```bash
# Check if Apache
apache2 -v

# Check if Nginx
nginx -v

# Check if Node.js
node -v
```

Then use the appropriate configuration from this guide!
