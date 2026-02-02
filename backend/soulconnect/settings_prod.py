import os
import dj_database_url
from .settings import *

DEBUG = False

# Allow Render and Vercel domains
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.onrender.com',
    '.vercel.app',
]

# Add any custom domain from environment
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# Database - Use DATABASE_URL from Render
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# CORS - Allow your Vercel frontend
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://kshatriyaconnect.vercel.app',
]

# Add any additional origins from environment
CORS_ORIGIN_ALLOW = os.environ.get('CORS_ALLOWED_ORIGINS', '')
if CORS_ORIGIN_ALLOW:
    additional_origins = [origin.strip() for origin in CORS_ORIGIN_ALLOW.split(',') if origin.strip()]
    CORS_ALLOWED_ORIGINS.extend(additional_origins)

# Static files with WhiteNoise
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Security settings for production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# CSRF Trusted Origins
CSRF_TRUSTED_ORIGINS = [
    'https://*.onrender.com',
    'https://*.vercel.app',
]

# Add any additional CSRF origins from environment
CSRF_ORIGINS_ENV = os.environ.get('CSRF_TRUSTED_ORIGINS', '')
if CSRF_ORIGINS_ENV:
    additional_csrf = [origin.strip() for origin in CSRF_ORIGINS_ENV.split(',') if origin.strip()]
    CSRF_TRUSTED_ORIGINS.extend(additional_csrf)

# Secret Key from environment
SECRET_KEY = os.environ.get('SECRET_KEY', SECRET_KEY)