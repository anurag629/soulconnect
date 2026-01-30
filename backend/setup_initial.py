#!/usr/bin/env python
"""
One-time setup script for initial deployment.
Run this manually after first deployment: python setup_initial.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'soulconnect.settings')
django.setup()

from accounts.models import User

def setup():
    # Create admin user if not exists
    if not User.objects.filter(email='admin@soulconnect.com').exists():
        User.objects.create_superuser(
            email='admin@soulconnect.com',
            password='Admin@123',
            first_name='Admin',
            last_name='User'
        )
        print('✅ Admin user created!')
    else:
        print('ℹ️  Admin user already exists')

    print('\n🎉 Setup complete!')

if __name__ == '__main__':
    setup()
