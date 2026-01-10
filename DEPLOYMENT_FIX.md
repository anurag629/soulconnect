# Deployment Error Fix Guide

## Issues Identified

Your deployed website is showing "Registration failed" and "Network error" messages due to the following issues:

### 1. **Missing CSRF Trusted Origins** ✅ FIXED
- Added `CSRF_TRUSTED_ORIGINS` configuration to settings.py
- This prevents CSRF token validation errors in production

### 2. **Frontend API URL Configuration** ⚠️ NEEDS ACTION
- Your frontend is pointing to `localhost:8000` which won't work in production
- Need to set the correct production backend URL

### 3. **Backend Environment Variables** ⚠️ NEEDS ACTION
- Production environment needs correct CORS and CSRF origins

---

## Required Actions

### A. Backend Deployment (Render/Your hosting)

Add these environment variables to your backend hosting platform:

```bash
# Your actual production domain
ALLOWED_HOSTS=your-backend-domain.onrender.com,localhost,127.0.0.1

# CORS - Your frontend domain
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000

# CSRF - Your frontend domain
CSRF_TRUSTED_ORIGINS=https://your-frontend.vercel.app,https://your-backend-domain.onrender.com

# Frontend URL for email links
FRONTEND_URL=https://your-frontend.vercel.app

# Set DEBUG to False for production
DEBUG=False

# Use production settings
DJANGO_SETTINGS_MODULE=soulconnect.settings_prod
```

### B. Frontend Deployment (Vercel/Your hosting)

Add this environment variable to your Vercel project:

```bash
# Your actual backend API URL
NEXT_PUBLIC_API_URL=https://your-backend-domain.onrender.com/api/v1
```

**Steps for Vercel:**
1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add `NEXT_PUBLIC_API_URL` with your backend URL
4. **Redeploy** your frontend after adding the variable

---

## Testing Checklist

After making the changes above, test these:

- [ ] Backend is accessible at your deployed URL
- [ ] Frontend loads without console errors
- [ ] Registration form submits successfully
- [ ] Check browser DevTools → Network tab for:
  - No CORS errors
  - No 403 (CSRF) errors
  - Successful POST to `/api/v1/auth/register/`
- [ ] Email verification is sent (check spam folder)

---

## Common Deployment Issues

### Issue: "Network error. Please check your connection."
**Cause:** Frontend cannot reach backend API
**Fix:** 
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Check backend is running and accessible
- Verify CORS origins include your frontend domain

### Issue: "Registration failed. Please try again."
**Cause:** CSRF token validation failed
**Fix:**
- Add your frontend domain to `CSRF_TRUSTED_ORIGINS`
- Ensure `CORS_ALLOW_CREDENTIALS = True` is set
- Check backend logs for specific error

### Issue: Mixed Content (HTTPS/HTTP)
**Cause:** Frontend (HTTPS) trying to call HTTP backend
**Fix:**
- Ensure backend URL uses `https://`
- Set `SECURE_SSL_REDIRECT = True` in production

---

## Verification Commands

### Check Backend Environment:
```bash
# SSH into your backend server
python manage.py shell

# Run these commands
from django.conf import settings
print("ALLOWED_HOSTS:", settings.ALLOWED_HOSTS)
print("CORS_ALLOWED_ORIGINS:", settings.CORS_ALLOWED_ORIGINS)
print("CSRF_TRUSTED_ORIGINS:", settings.CSRF_TRUSTED_ORIGINS)
print("DEBUG:", settings.DEBUG)
```

### Check Frontend Build:
```bash
# In your frontend directory
echo $NEXT_PUBLIC_API_URL  # Should show your backend URL
```

---

## Quick Fix Summary

1. **Backend hosting platform** (e.g., Render):
   - Add `CORS_ALLOWED_ORIGINS` environment variable
   - Add `CSRF_TRUSTED_ORIGINS` environment variable
   - Add `FRONTEND_URL` environment variable
   - Restart backend service

2. **Frontend hosting platform** (e.g., Vercel):
   - Add `NEXT_PUBLIC_API_URL` environment variable
   - Redeploy frontend

3. **Test the registration** again

---

## Need Help?

If issues persist:
1. Check browser DevTools → Console for JavaScript errors
2. Check browser DevTools → Network tab for failed requests
3. Check backend server logs for error details
4. Verify all environment variables are set correctly
