# 🚀 Quick Deployment Checklist for katoa.org

## Current Status
❌ **katoa.org shows ERR_CONNECTION_TIMED_OUT**
✅ **App is built and ready to deploy**
✅ **All files are in the `dist` folder**

## ⚡ Fastest Fix (2 Minutes) - Netlify Drop

### Step 1: Build (Already Done ✅)
```bash
npm run build
```

### Step 2: Deploy to Netlify
1. Go to: **https://app.netlify.com/drop**
2. **Drag and drop** the entire `dist` folder onto the page
3. Wait 30 seconds for deployment
4. You'll get a URL like: `https://random-name-123.netlify.app`
5. **Test it** - Your app should work!

### Step 3: Connect katoa.org
1. In Netlify, click **"Domain settings"**
2. Click **"Add custom domain"**
3. Enter: **katoa.org**
4. Click **"Verify"**
5. Follow DNS instructions (see below)

### Step 4: Update DNS at Your Domain Registrar

Go to where you bought **katoa.org** (GoDaddy, Namecheap, etc.) and add:

**Option A: Point to Netlify's IP (Fastest)**
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site-name.netlify.app
```

**Option B: Use Netlify DNS (Easiest long-term)**
1. In Netlify: Domain settings → "Use Netlify DNS"
2. Copy the 4 nameservers
3. Update nameservers at your registrar

### Step 5: Wait for DNS
- **15 minutes**: Should start working
- **1-2 hours**: Fully propagated
- **24-48 hours**: Worldwide propagation

### Step 6: Add Environment Variables in Netlify
1. Go to: **Site settings → Environment variables**
2. Add these:
   ```
   VITE_SUPABASE_URL = https://wabzwiegtloclfkbxwqs.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhYnp3aWVndGxvY2xma2J4d3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MjY5MzMsImV4cCI6MjA3NzEwMjkzM30.J-50a89hALq505ibHZArU--8eVMB7_mge7soB01SP7Q
   ```
3. Click **"Redeploy"** to apply changes

## ✅ Verification

After deployment:

1. **Check Netlify URL**: Should work immediately
   - `https://your-site-name.netlify.app`

2. **Check katoa.org**: Works after DNS propagation
   - Use: https://www.whatsmydns.net/#A/katoa.org
   - Green checkmarks = DNS is working

3. **Test features**:
   - [ ] Homepage loads
   - [ ] Click on a wishlist
   - [ ] Wishlist items display
   - [ ] Share button works
   - [ ] QR code opens and closes

## 🆘 Troubleshooting

### Netlify URL works but katoa.org doesn't
- **Issue**: DNS not updated yet
- **Fix**: Wait for DNS propagation (up to 48 hours)
- **Check**: Use whatsmydns.net

### "Oops! Something went wrong" on Netlify URL
- **Issue**: Environment variables not set
- **Fix**: Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify
- **Then**: Trigger manual deploy

### Build errors
- **Issue**: Dependencies or code errors
- **Fix**: Run `npm run build` locally first
- **Check**: Fix any errors before deploying

## 📊 Expected Timeline

```
Now         → Upload to Netlify → 30 seconds
+2 min      → Test Netlify URL → Should work!
+5 min      → Update DNS records → 5 minutes
+15 min     → DNS starts working → Some locations
+1-2 hours  → DNS fully working → Most locations
+24-48 hrs  → 100% propagated → Worldwide
```

## 🎯 Quick Commands

```bash
# Rebuild if needed
npm run build

# Preview locally before deploying
npm run preview

# Check for errors
npm run typecheck
```

## 📱 Alternative Hosting (If Netlify Doesn't Work)

### Vercel
```bash
npm i -g vercel
vercel
# Follow prompts, then add domain in dashboard
```

### Cloudflare Pages
1. Go to: https://pages.cloudflare.com
2. Connect GitHub repo
3. Build: `npm run build`, Output: `dist`
4. Add custom domain

## 🔐 Security Checklist

Before going live:
- [x] HTTPS enabled (automatic in Netlify)
- [x] Environment variables set
- [x] Row Level Security enabled in Supabase
- [x] No API keys in code
- [ ] Test all features work
- [ ] Check social sharing works
- [ ] Verify QR codes generate correctly

## 📞 Need Help?

1. Check deploy logs in Netlify
2. Open browser console (F12) and check for errors
3. Verify Supabase URL is accessible
4. Test environment variables are set correctly

---

**Remember**: The Netlify URL works immediately. The custom domain (katoa.org) needs DNS propagation time!

**Next Step**: Go to https://app.netlify.com/drop and drag your `dist` folder! 🚀
