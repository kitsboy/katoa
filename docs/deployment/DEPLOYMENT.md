# Deployment Guide for katoa.org

## Current Issue
Your domain `katoa.org` shows `ERR_CONNECTION_TIMED_OUT` because it's not connected to a hosting service yet.

## Quick Fix - Deploy to Netlify (Recommended)

### Option 1: Deploy via Netlify Drop (Easiest)

1. **Build the project** (already done):
   ```bash
   npm run build
   ```

2. **Go to Netlify Drop**: https://app.netlify.com/drop

3. **Drag & Drop** the `dist` folder onto the page

4. **Your site will deploy** at a URL like: `https://random-name-123.netlify.app`

5. **Connect your domain**:
   - In Netlify, go to: Site settings → Domain management
   - Click "Add custom domain"
   - Enter: `katoa.org`
   - Follow the DNS instructions

### Option 2: Deploy via GitHub (Best for updates)

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/bitwish.git
   git push -u origin main
   ```

2. **Connect to Netlify**:
   - Go to https://app.netlify.com/
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub
   - Select your repository
   - Build settings (auto-detected from netlify.toml):
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

3. **Add Environment Variables** in Netlify:
   - Go to: Site settings → Environment variables
   - Add these variables:
     ```
     VITE_SUPABASE_URL=https://wabzwiegtloclfkbxwqs.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhYnp3aWVndGxvY2xma2J4d3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MjY5MzMsImV4cCI6MjA3NzEwMjkzM30.J-50a89hALq505ibHZArU--8eVMB7_mge7soB01SP7Q
     ```

4. **Connect custom domain**:
   - In Netlify: Site settings → Domain management
   - Add custom domain: `katoa.org`

## DNS Configuration for katoa.org

Once you have your Netlify site URL, update your DNS records:

### If using Netlify DNS (Easiest):
1. In Netlify, go to: Domains → katoa.org → Options → "Use Netlify DNS"
2. Copy the nameservers (4 addresses like ns1.netlify.com)
3. Go to your domain registrar (where you bought katoa.org)
4. Update nameservers to the ones Netlify provided
5. Wait 24-48 hours for DNS propagation

### If using your own DNS:
Add these records at your domain registrar:

```
Type: A
Name: @
Value: 75.2.60.5  (Netlify's IP)

Type: CNAME
Name: www
Value: YOUR-SITE-NAME.netlify.app
```

## Alternative Hosting Options

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts
4. Add domain in Vercel dashboard

### Cloudflare Pages
1. Go to: https://pages.cloudflare.com/
2. Connect GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add custom domain

### AWS Amplify
1. Go to: https://console.aws.amazon.com/amplify/
2. Connect repository
3. Build settings auto-detected
4. Add custom domain

## Checking Deployment Status

After deploying, test these URLs:

1. **Netlify URL**: `https://YOUR-SITE.netlify.app` (should work immediately)
2. **Custom domain**: `https://katoa.org` (works after DNS propagation)

### Troubleshooting DNS

Check DNS propagation:
```bash
# Check if DNS is working
dig katoa.org
nslookup katoa.org

# Or use online tool:
# https://www.whatsmydns.net/#A/katoa.org
```

## Post-Deployment Checklist

- [ ] Site loads at Netlify URL
- [ ] Environment variables configured
- [ ] Custom domain DNS configured
- [ ] SSL certificate active (auto in Netlify)
- [ ] Test Supabase connection
- [ ] Test social sharing
- [ ] Test QR code generation
- [ ] Test wishlist items display

## Environment Variables Needed

Make sure these are set in your hosting platform:

```env
VITE_SUPABASE_URL=https://wabzwiegtloclfkbxwqs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhYnp3aWVndGxvY2xma2J4d3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MjY5MzMsImV4cCI6MjA3NzEwMjkzM30.J-50a89hALq505ibHZArU--8eVMB7_mge7soB01SP7Q
```

Optional (for future features):
```env
VITE_BTCPAY_SERVER_URL=
VITE_BTCPAY_STORE_ID=
VITE_BTCPAY_API_KEY=
```

## Quick Commands

```bash
# Development
npm run dev

# Build
npm run build

# Preview build locally
npm run preview

# Type check
npm run typecheck

# Lint
npm run lint
```

## Support

If you continue having issues:
1. Check Netlify deploy logs for errors
2. Verify environment variables are set
3. Check browser console for errors (F12)
4. Verify Supabase URL is accessible

## Timeline

- **Immediate**: Netlify URL works
- **15 minutes**: DNS starts propagating
- **24-48 hours**: Full DNS propagation worldwide
- **katoa.org should be live**: Within 1-2 hours typically

---

**Next Steps**: Choose a deployment method above and follow the steps. The Netlify Drop method is the fastest way to get online in under 2 minutes!
