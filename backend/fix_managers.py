"""
Script to fix and verify manager accounts.
This ensures managers have correct credentials and settings.
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

def fix_managers():
    """Fix manager accounts - ensure they exist with correct credentials."""
    fixed_count = 0
    created_count = 0
    
    for manager_data in MANAGERS:
        email = manager_data['email']
        password = manager_data['password']
        
        # Check if manager exists
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            # Update password and all manager settings
            user.set_password(password)
            user.is_manager = True
            user.is_active = True
            user.is_email_verified = True
            user.is_profile_complete = True
            user.is_profile_approved = True
            user.is_staff = True  # Allow access to admin
            user.save()
            print(f"[FIXED] Updated manager account: {email}")
            fixed_count += 1
        else:
            # Create new manager
            user = User.objects.create_user(
                email=email,
                password=password,
                first_name=manager_data['first_name'],
                last_name=manager_data['last_name'],
                is_manager=True,
                is_active=True,
                is_email_verified=True,
                is_profile_complete=True,
                is_profile_approved=True,
                is_staff=True,  # Allow access to admin
            )
            print(f"[CREATED] New manager account: {email}")
            created_count += 1
    
    print(f"\n{'='*50}")
    print(f"Manager Fix Summary:")
    print(f"  Fixed: {fixed_count}")
    print(f"  Created: {created_count}")
    print(f"{'='*50}")
    print(f"\nManager Credentials:")
    for manager_data in MANAGERS:
        print(f"  Email: {manager_data['email']}")
        print(f"  Password: {manager_data['password']}")
        print()
    
    # Verify managers can authenticate
    print("Verifying manager authentication...")
    from django.contrib.auth import authenticate
    for manager_data in MANAGERS:
        email = manager_data['email']
        password = manager_data['password']
        user = authenticate(username=email, password=password)
        if user and user.is_manager:
            print(f"  [OK] {email} - Authentication successful")
        else:
            print(f"  [FAIL] {email} - Authentication failed")

if __name__ == '__main__':
    fix_managers()
