import os
from .settings import *

DEBUG = False

ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'your-domain.com', 'www.your-domain.com']

# PostgreSQL Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'soulconnect_db',
        'USER': 'soulconnect_user',
        'PASSWORD': 'Soulconnect@123',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Security settings for production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True