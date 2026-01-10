# Quick Deployment Checklist

## ✅ Backend Fixed
- [x] Added CSRF_TRUSTED_ORIGINS to settings.py
- [x] Updated settings_prod.py to handle environment variables properly
- [x] Updated .env.example with CSRF configuration

## ⚠️ Action Required

### 1. Update Backend Environment Variables

Go to your backend hosting platform (Render, Railway, etc.) and set:

```bash
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
CSRF_TRUSTED_ORIGINS=https://your-frontend-domain.vercel.app,https://your-backend-domain.onrender.com
FRONTEND_URL=https://your-frontend-domain.vercel.app
DEBUG=False
```

**Replace:**
- `your-frontend-domain.vercel.app` with your actual Vercel frontend URL
- `your-backend-domain.onrender.com` with your actual backend URL

### 2. Update Frontend Environment Variable

Go to Vercel → Your Project → Settings → Environment Variables:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.onrender.com/api/v1
```

**Replace:**
- `your-backend-domain.onrender.com` with your actual backend URL

### 3. Redeploy

- Backend: Redeploy after setting environment variables
- Frontend: Redeploy after adding NEXT_PUBLIC_API_URL

---

## Testing

After deployment:

1. Open your deployed frontend in browser
2. Open DevTools (F12) → Network tab
3. Try to register
4. Check for:
   - ✅ Request goes to correct backend URL
   - ✅ No CORS errors
   - ✅ No 403 (CSRF) errors
   - ✅ Response is successful

---

## Common Issues & Quick Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| Network error | Backend URL not set | Set `NEXT_PUBLIC_API_URL` in Vercel |
| CORS error | Frontend domain not allowed | Add to `CORS_ALLOWED_ORIGINS` in backend |
| 403 Forbidden | CSRF validation failed | Add to `CSRF_TRUSTED_ORIGINS` in backend |
| Mixed content | Using http:// instead of https:// | Use https:// for all production URLs |

---

## Need Your Deployed URLs

To give you the exact configuration, please provide:

1. **Backend URL:** https://______________.onrender.com
2. **Frontend URL:** https://______________.vercel.app

Then I can give you the exact environment variables to set!
