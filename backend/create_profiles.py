"""
Script to create profiles for users who don't have one.
"""
import django
django.setup()

from accounts.models import User
from profiles.models import Profile
from datetime import date

count = 0
for user in User.objects.all():
    if not Profile.objects.filter(user=user).exists():
        Profile.objects.create(
            user=user,
            full_name=f'{user.first_name} {user.last_name}'.strip() or 'New User',
            gender='M',
            date_of_birth=date(1990, 1, 1),
            height_cm=170,
            marital_status='never_married',
            religion='hindu',
            mother_tongue='Hindi',
            education='bachelors',
            profession='Professional',
            annual_income='5-10',
            city='Mumbai',
            state='Maharashtra',
            country='India',
            about_me='Welcome to my profile!',
        )
        print(f'Created profile for {user.email}')
        count += 1

print(f'\nTotal profiles created: {count}')
print(f'Total users: {User.objects.count()}')
print(f'Total profiles: {Profile.objects.count()}')
