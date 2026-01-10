#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate

# Create superuser and subscription plans
python << END
import django
django.setup()

from accounts.models import User
from payments.models import SubscriptionPlan

# Create admin user if not exists
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

# Create subscription plans
plans = [
    {'name': 'Free', 'code': 'FREE', 'price': 0, 'duration_days': 36500, 'description': 'Basic free plan', 'features': ['View 5 profiles per day'], 'is_active': True, 'display_order': 1},
    {'name': 'Gold Monthly', 'code': 'GOLD_MONTHLY', 'price': 99900, 'duration_days': 30, 'description': 'Gold plan', 'features': ['Unlimited profiles', 'Chat with matches'], 'is_active': True, 'is_popular': True, 'display_order': 2},
    {'name': 'Premium Monthly', 'code': 'PREMIUM_MONTHLY', 'price': 199900, 'duration_days': 30, 'description': 'Premium plan', 'features': ['All features unlocked'], 'is_active': True, 'display_order': 3},
]

for p in plans:
    obj, created = SubscriptionPlan.objects.get_or_create(code=p['code'], defaults=p)
    if created:
        print(f'Created plan: {obj.name}')
    else:
        print(f'Plan exists: {obj.name}')

print('Setup complete!')
END
