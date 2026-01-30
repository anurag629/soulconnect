#!/usr/bin/env bash
# Exit on error
set -o errexit

# Optimize pip for faster installs
export PIP_DISABLE_PIP_VERSION_CHECK=1
export PIP_NO_CACHE_DIR=0

# Upgrade pip for better dependency resolution
pip install --upgrade pip setuptools wheel

# Install dependencies with optimizations
# --no-deps first pass for pre-built wheels, then full install
pip install -r requirements.txt --prefer-binary

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate

# Create admin user if not exists
python << END
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'soulconnect.settings_prod')
django.setup()

from accounts.models import User

if not User.objects.filter(email='admin@soulconnect.com').exists():
    User.objects.create_superuser(
        email='admin@soulconnect.com',
        password='Admin@123',
        first_name='Admin',
        last_name='User'
    )
    print('Admin user created!')
else:
    print('Admin user already exists')

print('Setup complete!')
END
