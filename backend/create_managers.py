"""
Script to create two manager accounts with fixed credentials.
Run this script once to seed the manager accounts.

Usage: python manage.py shell < create_managers.py
Or: python manage.py runscript create_managers (if using django-extensions)
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'soulconnect.settings_dev')
django.setup()

from accounts.models import User

# Manager credentials (hardcoded as per requirements)
MANAGERS = [
    {
        'email': 'manager1@soulconnect.in',
        'password': 'Manager@123',
        'first_name': 'Manager',
        'last_name': 'One',
    },
    {
        'email': 'manager2@soulconnect.in',
        'password': 'Manager@456',
        'first_name': 'Manager',
        'last_name': 'Two',
    },
]

def create_managers():
    """Create manager accounts if they don't exist."""
    created_count = 0
    existing_count = 0
    
    for manager_data in MANAGERS:
        email = manager_data['email']
        
        # Check if manager already exists
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            if not user.is_manager:
                user.is_manager = True
                user.is_active = True
                user.is_email_verified = True
                user.is_profile_complete = True
                user.is_profile_approved = True
                user.save()
                print(f"[OK] Updated existing user {email} to manager")
            else:
                print(f"[INFO] Manager {email} already exists")
            existing_count += 1
        else:
            # Create new manager
            user = User.objects.create_user(
                email=email,
                password=manager_data['password'],
                first_name=manager_data['first_name'],
                last_name=manager_data['last_name'],
                is_manager=True,
                is_active=True,
                is_email_verified=True,
                is_profile_complete=True,
                is_profile_approved=True,
            )
            print(f"[OK] Created manager account: {email}")
            created_count += 1
    
    print(f"\n{'='*50}")
    print(f"Manager Creation Summary:")
    print(f"  Created: {created_count}")
    print(f"  Already existed: {existing_count}")
    print(f"{'='*50}")
    print(f"\nManager Credentials:")
    for manager_data in MANAGERS:
        print(f"  Email: {manager_data['email']}")
        print(f"  Password: {manager_data['password']}")
        print()

if __name__ == '__main__':
    create_managers()
