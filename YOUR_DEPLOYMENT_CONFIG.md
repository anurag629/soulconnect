# Your Exact Deployment Configuration

## Backend Configuration (Render)

Go to your Render dashboard → soulconnect-backend-dg0k → Environment

Add/Update these environment variables:

```bash
# CORS - Allow your frontend
CORS_ALLOWED_ORIGINS=https://soulconnect-taupe.vercel.app

# CSRF - Prevent CSRF errors
CSRF_TRUSTED_ORIGINS=https://soulconnect-taupe.vercel.app,https://soulconnect-backend-dg0k.onrender.com

# Frontend URL for email links
FRONTEND_URL=https://soulconnect-taupe.vercel.app

# Allowed hosts
ALLOWED_HOSTS=soulconnect-backend-dg0k.onrender.com,localhost,127.0.0.1

# Production mode
DEBUG=False

# Make sure these are set (if not already)
SECRET_KEY=your-secret-key-from-render
DATABASE_URL=your-postgres-url-from-render
SENDGRID_API_KEY=your-sendgrid-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
AZURE_STORAGE_ACCOUNT_NAME=your-azure-storage
AZURE_STORAGE_ACCOUNT_KEY=your-azure-key
AZURE_STORAGE_CONTAINER=media
```

**After setting these, click "Manual Deploy" → "Deploy latest commit"**

---

## Frontend Configuration (Vercel)

Go to Vercel → soulconnect-taupe → Settings → Environment Variables

Add this environment variable:

```bash
Variable name:  NEXT_PUBLIC_API_URL
Value:          https://soulconnect-backend-dg0k.onrender.com/api/v1
```

**Important:** 
- Apply to: Production, Preview, and Development
- After adding, go to Deployments tab → Click "..." → "Redeploy"

---

## Step-by-Step Instructions

### 1. Backend (Render) - 5 minutes

1. Go to https://dashboard.render.com
2. Click on your backend service: `soulconnect-backend-dg0k`
3. Click **Environment** in the left sidebar
4. Add each variable above (click "Add Environment Variable")
5. Important ones to add/update:
   - `CORS_ALLOWED_ORIGINS`
   - `CSRF_TRUSTED_ORIGINS`
   - `FRONTEND_URL`
   - `DEBUG=False`
6. Click **"Save Changes"**
7. Go to **"Manual Deploy"** → **"Deploy latest commit"**
8. Wait for deployment to complete (~5 minutes)

### 2. Frontend (Vercel) - 2 minutes

1. Go to https://vercel.com
2. Click on your project: `soulconnect-taupe`
3. Click **Settings** tab
4. Click **Environment Variables** in sidebar
5. Click **"Add New"**
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://soulconnect-backend-dg0k.onrender.com/api/v1`
   - Environments: Check all (Production, Preview, Development)
6. Click **"Save"**
7. Go to **Deployments** tab
8. Click the **"..."** menu on the latest deployment
9. Click **"Redeploy"**
10. Wait for deployment (~1 minute)

---

## Testing After Deployment

1. Open: https://soulconnect-taupe.vercel.app/register
2. Open browser DevTools (F12) → Network tab
3. Fill in registration form and submit
4. Check Network tab:
   - ✅ Request should go to: `https://soulconnect-backend-dg0k.onrender.com/api/v1/auth/register/`
   - ✅ Status should be: `201 Created` (success)
   - ❌ Should NOT see CORS errors
   - ❌ Should NOT see 403 Forbidden

---

## Verification Checklist

After both deployments complete:

- [ ] Backend is accessible: https://soulconnect-backend-dg0k.onrender.com
- [ ] Frontend loads: https://soulconnect-taupe.vercel.app
- [ ] Registration form submits successfully
- [ ] No CORS errors in browser console
- [ ] No 403 CSRF errors
- [ ] Success message: "Registration successful! Please check your email..."

---

## Quick Test Commands

### Test Backend API:
```bash
curl https://soulconnect-backend-dg0k.onrender.com/api/v1/
```

### Test CORS (from browser console on your frontend):
```javascript
fetch('https://soulconnect-backend-dg0k.onrender.com/api/v1/', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

---

## If You Still Get Errors

### Error: "Network error"
**Check:**
- Is `NEXT_PUBLIC_API_URL` set in Vercel? 
- Did you redeploy frontend after adding it?
- Is backend service running on Render?

### Error: "CORS error"
**Check:**
- Is `CORS_ALLOWED_ORIGINS` set in Render?
- Does it include `https://soulconnect-taupe.vercel.app` (no trailing slash)?
- Did you redeploy backend after adding it?

### Error: "403 Forbidden"
**Check:**
- Is `CSRF_TRUSTED_ORIGINS` set in Render?
- Does it include both frontend and backend URLs?
- Are you using `https://` not `http://`?

---

## Expected Timeline

- Backend deployment: ~5 minutes
- Frontend deployment: ~1 minute
- Total time: **~6-7 minutes**

After this, your registration should work perfectly! 🎉
