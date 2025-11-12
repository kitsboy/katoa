# 🚀 UPLOAD TO YOUR CPANEL SERVER (64.69.94.188)

## ✅ File Ready: CPANEL-UPLOAD.tar.gz (235KB)

This file contains your complete website ready for YOUR cPanel server.

---

## 📋 STEP-BY-STEP UPLOAD INSTRUCTIONS

### Step 1: Open cPanel File Manager
1. Log into your cPanel (the control panel at your hosting provider)
2. Click **File Manager**
3. You should see the screen from your first screenshot

### Step 2: Navigate to public_html
1. In the left sidebar, click on **public_html** folder
2. You should now see folders like: cgi-bin, project, etc.

### Step 3: Clean Out public_html (IMPORTANT!)
**This is critical - public_html must be empty:**

1. Click **Settings** (top right gear icon)
2. Check the box: **Show Hidden Files (dotfiles)**
3. Click **Save**
4. Now select ALL files and folders in public_html:
   - cgi-bin folder
   - project folder
   - Any zip files
   - Everything except . and ..
5. Click **Delete** button
6. Confirm deletion
7. public_html should now be EMPTY

### Step 4: Upload CPANEL-UPLOAD.tar.gz
1. Make sure you're IN the public_html folder (check the path at top)
2. Click **Upload** button (top toolbar)
3. Click **Select File**
4. Find and select: `CPANEL-UPLOAD.tar.gz` from your project folder
   - Full path: `/tmp/cc-agent/59261828/project/CPANEL-UPLOAD.tar.gz`
5. Wait for upload to complete (235KB, should be instant)
6. Close the upload window

### Step 5: Extract the Archive
1. Back in File Manager, you should see `CPANEL-UPLOAD.tar.gz` in public_html
2. **Right-click** on `CPANEL-UPLOAD.tar.gz`
3. Click **Extract**
4. Extract to: `/home/katoa/public_html` (should be pre-filled)
5. Click **Extract File(s)** button
6. Wait for extraction to complete
7. Click **Close**

### Step 6: Delete the Archive
1. Select `CPANEL-UPLOAD.tar.gz`
2. Click **Delete**
3. Confirm

### Step 7: Verify Files
After extraction, public_html should contain exactly these items:

```
public_html/
├── .htaccess          (hidden file - you need "Show Hidden Files" enabled)
├── index.html         (577 bytes)
├── Bitcoin.svg.png    (11KB)
├── donation-qr.png    (50KB)
├── favicon.ico        (11KB)
├── _redirects         (19 bytes)
└── assets/            (folder)
    ├── index-BmIrLL9R.js  (575KB)
    └── index-Cp8IORBf.css (38KB)
```

**Total: 6 files + 1 folder = 7 items**

### Step 8: Check File Permissions
1. Select all files in public_html
2. Click **Permissions** button (top toolbar)
3. For FILES (index.html, images, etc.):
   - Should be: **644** (rw-r--r--)
4. For FOLDERS (assets):
   - Should be: **755** (rwxr-xr-x)
5. If wrong, fix them and click **Change Permissions**

---

## 🌐 DNS CONFIGURATION

Your domain needs to point to your cPanel server.

### Check Your Current DNS:

Visit: https://www.whatsmydns.net/#A/katoa.org

**It should show:** 64.69.94.188

**If it shows something else**, you need to update DNS at your domain registrar.

### To Update DNS:

1. **Log into where you bought katoa.org**
   - GoDaddy, Namecheap, Cloudflare, etc.

2. **Find DNS Management** or "DNS Settings"

3. **Add/Update A Record:**
   ```
   Type: A
   Name: @ (or blank, or katoa.org)
   Value: 64.69.94.188
   TTL: 3600 (or Auto)
   ```

4. **Add CNAME for www (optional):**
   ```
   Type: CNAME
   Name: www
   Value: katoa.org
   TTL: 3600
   ```

5. **Save changes**

6. **Wait for DNS propagation** (15 minutes to 48 hours, usually 1-2 hours)

---

## ✅ TESTING YOUR SITE

### Test Using IP Address (Works Immediately):
1. Open browser in **incognito/private mode**
2. Visit: `http://64.69.94.188`
3. You should see your BitWish website immediately
4. All images should load
5. Navigation should work

### Test Using Domain Name (After DNS propagates):
1. Visit: `https://katoa.org`
2. May take 1-48 hours for DNS to update
3. Should show the same site as the IP address

### Check Browser Console:
1. Press **F12** to open DevTools
2. Click **Console** tab
3. Should see NO errors (especially no "Missing Supabase" errors)
4. If you see errors, screenshot and share them

---

## 🆘 TROUBLESHOOTING

### If you see a blank white screen:
1. **Check .htaccess was uploaded**
   - Enable "Show Hidden Files" in File Manager
   - Verify `.htaccess` exists in public_html
   - File size should be 203 bytes (not 0)

2. **Check assets folder exists**
   - Click on `assets` folder
   - Should contain 2 files (JS and CSS)

3. **Hard refresh browser**
   - Windows: Ctrl + Shift + R
   - Mac: Cmd + Shift + R

### If images don't show:
1. **Click on an image in File Manager**
   - Should show image preview (not text)
   - If it shows text/code, images didn't upload correctly

2. **Check file permissions**
   - Images should be 644

### If you get 404 errors:
1. **Check you're in the right folder**
   - Files must be in `/home/katoa/public_html`
   - NOT in `/home/katoa/public_html/project`
   - NOT in any subfolder

### If site still times out:
1. **Check Apache is running**
   - In cPanel, go to "Service Status"
   - Apache should be "running"

2. **Check DNS is pointing to your server**
   - Visit: https://www.whatsmydns.net/#A/katoa.org
   - Should show 64.69.94.188 everywhere
   - If not, update DNS at your domain registrar

---

## 📂 FILES YOU NEED

**Main file:** `CPANEL-UPLOAD.tar.gz` (235KB)

**Location:** `/tmp/cc-agent/59261828/project/CPANEL-UPLOAD.tar.gz`

Or you can upload individual files from the `dist` folder if you prefer.

---

## ✅ CHECKLIST

- [ ] Logged into cPanel
- [ ] Opened File Manager
- [ ] Enabled "Show Hidden Files"
- [ ] Navigated to public_html
- [ ] DELETED all old files in public_html
- [ ] Uploaded CPANEL-UPLOAD.tar.gz
- [ ] Right-clicked and extracted archive
- [ ] Deleted the .tar.gz file after extraction
- [ ] Verified 7 items in public_html (6 files + 1 folder)
- [ ] Confirmed .htaccess file exists
- [ ] Checked file permissions (644 for files, 755 for folders)
- [ ] Tested site using IP: http://64.69.94.188
- [ ] Site loads with images and no errors
- [ ] Checked DNS points to 64.69.94.188
- [ ] Waited for DNS propagation
- [ ] Tested site using domain: https://katoa.org

---

## 🎉 SUCCESS = You should see:

- BitWish homepage with Bitcoin logo
- Orange navigation header
- All images loading
- All pages working (Home, About, Explore, etc.)
- No console errors
- Supabase connected

---

**This will work.** The key is making sure files are in the ROOT of public_html, not in a subfolder.
