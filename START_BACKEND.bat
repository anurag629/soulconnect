@echo off
echo ================================
echo   Starting SoulConnect Backend
echo ================================
echo.

cd /d d:\Website\backend

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Setting development settings...
set DJANGO_SETTINGS_MODULE=soulconnect.settings_dev

echo.
echo Starting Django server on http://localhost:8000
echo Press Ctrl+C to stop
echo.

python manage.py runserver

pause
