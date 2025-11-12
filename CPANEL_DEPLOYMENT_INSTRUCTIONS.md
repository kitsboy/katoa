# cPanel Deployment Instructions for katoa.org

## ✅ Build Complete!

Your project has been successfully built with all environment variables included. The blank white screen issue will be fixed once you upload these new files.

---

## 📦 What You Need to Upload

All files are ready in the `dist` folder. I've also created a compressed archive: `katoa-org-deployment.tar.gz` (167KB) for easier upload.

---

## 🚀 Step-by-Step Deployment Instructions

### Option 1: Upload via cPanel File Manager (Recommended - Easiest)

1. **Log into your cPanel**
   - Go to your hosting provider's control panel
   - Your server IP: `64.69.94.188`
   - Look for "cPanel" login

2. **Navigate to File Manager**
   - In cPanel, find and click "File Manager"
   - Navigate to `public_html` folder (this is your website root)

3. **Backup Existing Files (Important!)**
   - Select all files in `public_html`
   - Click "Compress" → Create `backup-old-site.zip`
   - This lets you restore if needed

4. **Delete Old Files**
   - Select all files in `public_html` (except the backup you just made)
   - Click "Delete"

5. **Upload New Files - Choose One Method:**

   **Method A: Upload Archive (Faster)**
   - Click "Upload" button
   - Upload `katoa-org-deployment.tar.gz` from your project folder
   - After upload, right-click the file → "Extract"
   - Delete the `.tar.gz` file after extraction

   **Method B: Upload Individual Files**
   - Click "Upload" button
   - Navigate to your project's `dist` folder on your computer
   - Select ALL files including hidden files (like `.htaccess`)
   - Upload them to `public_html`

6. **Verify Files Were Uploaded**
   - Check that `public_html` contains:
     - `index.html`
     - `.htaccess` (important for routing!)
     - `assets` folder (with CSS and JS files)
     - `Bitcoin.svg.png`
     - `donation-qr.png`
     - `favicon.ico`
     - `_redirects` (optional, for backup)

7. **Set Permissions (if needed)**
   - Select all files
   - Click "Change Permissions"
   - Files should be: 644 (readable)
   - Folders should be: 755 (executable)

---

### Option 2: Upload via FTP (Alternative)

If you prefer using an FTP client like FileZilla:

1. **FTP Connection Details:**
   - Host: `64.69.94.188` or `ftp.katoa.org`
   - Username: (your cPanel username)
   - Password: (your cPanel password)
   - Port: 21 (FTP) or 22 (SFTP)

2. **Connect and Upload:**
   - Connect to your server
   - Navigate to `public_html` folder
   - Delete old files (backup first!)
   - Upload all files from your local `dist` folder
   - Make sure to upload hidden files like `.htaccess`

---

## 🌐 DNS Configuration for katoa.org

### Current Setup Check

Your server IP: **64.69.94.188**

You need to verify your DNS A record is pointing to this IP.

### To Check/Configure DNS:

1. **Log into your domain registrar** (where you bought katoa.org)
   - This could be: GoDaddy, Namecheap, Cloudflare, etc.

2. **Find DNS Management**
   - Look for: "DNS Management", "DNS Settings", or "Nameservers"

3. **Add/Update A Record:**
   ```
   Type: A
   Name: @ (or blank, or katoa.org)
   Value: 64.69.94.188
   TTL: 3600 (or default)
   ```

4. **Add WWW CNAME (Optional but recommended):**
   ```
   Type: CNAME
   Name: www
   Value: katoa.org
   TTL: 3600
   ```

5. **Save Changes**
   - DNS changes take 15 minutes to 48 hours to propagate
   - Usually works within 1-2 hours

---

## ✅ Verification Steps

### After Uploading Files:

1. **Clear your browser cache** or open an incognito/private window

2. **Visit your site:**
   - Try: `http://64.69.94.188` (should work immediately if files uploaded correctly)
   - Try: `https://katoa.org` (may take time for DNS propagation)

3. **Check for errors:**
   - Press F12 to open DevTools Console
   - Should see NO errors (especially no "Missing Supabase environment variables")
   - The site should load completely with all pages working

4. **Test functionality:**
   - Navigate to different pages (About, Explore, etc.)
   - Check that images load
   - Verify the app is fully functional

---

## 🔧 Troubleshooting

### If you still see a blank white screen:

1. **Check .htaccess was uploaded**
   - In cPanel File Manager, show hidden files (Settings → Show Hidden Files)
   - Verify `.htaccess` exists in `public_html`

2. **Check file permissions**
   - Files: 644
   - Folders: 755

3. **Check browser console (F12)**
   - Look for 404 errors on JavaScript files
   - Look for any error messages

4. **Clear browser cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

5. **Check if assets folder uploaded**
   - The `assets` folder should contain:
     - `index-BmIrLL9R.js` (575KB)
     - `index-Cp8IORBf.css` (38KB)

### If DNS isn't working:

1. **Check DNS propagation:**
   - Visit: https://www.whatsmydns.net/#A/katoa.org
   - Should show: 64.69.94.188

2. **Verify A record in your domain registrar**
   - Make sure it points to: 64.69.94.188

3. **Wait for propagation**
   - Can take up to 48 hours (usually much faster)
   - Test using IP address: `http://64.69.94.188` while waiting

---

## 📋 Quick Checklist

- [ ] Backed up old files from public_html
- [ ] Deleted old files from public_html
- [ ] Uploaded all new files from dist folder
- [ ] Verified .htaccess file is present
- [ ] Checked file permissions (644 for files, 755 for folders)
- [ ] Verified DNS A record points to 64.69.94.188
- [ ] Tested site using server IP: http://64.69.94.188
- [ ] Tested site using domain: https://katoa.org
- [ ] No errors in browser console (F12)
- [ ] All pages load correctly

---

## 🎉 Expected Result

Once uploaded, your site will:
- Load immediately (no blank white screen)
- Show your BitWish homepage with Bitcoin theme
- Allow navigation to all pages
- Connect properly to Supabase database
- Display all images and styling correctly

---

## 🆘 Need Help?

If you encounter issues:

1. Check the browser console for specific error messages
2. Verify all files uploaded correctly to `public_html`
3. Confirm `.htaccess` file is present and readable
4. Test using the IP address first before troubleshooting DNS

The most common issue is forgetting to upload the `.htaccess` file or uploading files to the wrong folder.

---

## 📁 Files Location Summary

- **Your project files:** `/tmp/cc-agent/59261828/project/`
- **Built files ready to upload:** `/tmp/cc-agent/59261828/project/dist/`
- **Compressed archive:** `/tmp/cc-agent/59261828/project/katoa-org-deployment.tar.gz`
- **Server destination:** `public_html` folder in your cPanel

---

**That's it!** Once you upload these files, your blank white screen issue will be resolved. The new build includes all the Supabase environment variables that were missing before.
