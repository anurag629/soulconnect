@echo off
echo ================================
echo   KSHATRIYAConnect - First Time Setup
echo ================================
echo.
echo This script will set up everything for you!
echo.

REM Backend Setup
echo [1/6] Setting up Backend...
cd /d d:\Website\backend

echo [2/6] Creating virtual environment...
python -m venv venv
call venv\Scripts\activate.bat

echo [3/6] Installing Python packages...
pip install -r requirements_dev.txt

echo [4/6] Setting up database...
set DJANGO_SETTINGS_MODULE=soulconnect.settings_dev
python manage.py migrate

echo [5/6] Creating admin user...
python -c "import django; django.setup(); from accounts.models import User; User.objects.create_superuser(email='admin@kshatriyaconnect.com', password='Admin@123', first_name='Admin', last_name='User') if not User.objects.filter(email='admin@kshatriyaconnect.com').exists() else print('Admin exists')"

REM Frontend Setup
echo [6/6] Setting up Frontend...
cd /d d:\Website\frontend
call npm install

echo.
echo ================================
echo   Setup Complete!
echo ================================
echo.
echo To start the application:
echo   1. Double-click START_BACKEND.bat
echo   2. Double-click START_FRONTEND.bat (in a new window)
echo   3. Open http://localhost:3000 in your browser
echo.
echo Admin Login:
echo   Email: admin@kshatriyaconnect.com
echo   Password: Admin@123
echo.

pause
