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

# Create admin user and managers if not exists
python << END
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'soulconnect.settings_prod')
django.setup()

from accounts.models import User

# Create admin user
if not User.objects.filter(email='admin@kshatriyaconnect.com').exists():
    User.objects.create_superuser(
        email='admin@kshatriyaconnect.com',
        password='Admin@123',
        first_name='Admin',
        last_name='User'
    )
    print('Admin user created!')
else:
    print('Admin user already exists')

# Create/Update manager accounts
MANAGERS = [
    {
        'email': 'manager1@kshatriyaconnect.in',
        'password': 'Manager@123',
        'first_name': 'Manager',
        'last_name': 'One',
    },
    {
        'email': 'manager2@kshatriyaconnect.in',
        'password': 'Manager@456',
        'first_name': 'Manager',
        'last_name': 'Two',
    },
]

for manager_data in MANAGERS:
    email = manager_data['email']
    if User.objects.filter(email=email).exists():
        user = User.objects.get(email=email)
        user.set_password(manager_data['password'])
        user.is_manager = True
        user.is_active = True
        user.is_email_verified = True
        user.is_profile_complete = True
        user.is_profile_approved = True
        user.is_staff = True
        user.save()
        print(f'Manager account updated: {email}')
    else:
        User.objects.create_user(
            email=email,
            password=manager_data['password'],
            first_name=manager_data['first_name'],
            last_name=manager_data['last_name'],
            is_manager=True,
            is_active=True,
            is_email_verified=True,
            is_profile_complete=True,
            is_profile_approved=True,
            is_staff=True,
        )
        print(f'Manager account created: {email}')

print('Setup complete!')
END
