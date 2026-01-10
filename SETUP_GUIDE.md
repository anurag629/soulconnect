# 🚀 SoulConnect - Complete Setup Guide for Beginners

This guide will walk you through setting up the SoulConnect matrimonial platform step by step. No prior experience needed!

---

## 📋 Prerequisites (What You Need First)

Before starting, make sure you have these installed on your computer:

### 1. Python (version 3.10 or higher)
- Download from: https://www.python.org/downloads/
- **IMPORTANT**: During installation, check ✅ "Add Python to PATH"
- To verify installation, open Command Prompt/PowerShell and type:
  ```
  python --version
  ```
  You should see something like `Python 3.11.x`

### 2. Node.js (version 18 or higher)
- Download from: https://nodejs.org/ (choose LTS version)
- To verify installation:
  ```
  node --version
  npm --version
  ```

### 3. Git (optional but recommended)
- Download from: https://git-scm.com/downloads

### 4. VS Code (recommended code editor)
- Download from: https://code.visualstudio.com/

---

## 📁 Project Structure

```
D:\Website\
├── backend/          ← Django (Python) - handles data, users, API
│   ├── accounts/     ← User authentication
│   ├── profiles/     ← User profiles
│   ├── matching/     ← Like, Match features
│   ├── chat/         ← Messaging
│   ├── payments/     ← Subscriptions
│   └── ...
│
└── frontend/         ← Next.js (React) - what users see in browser
    ├── src/
    │   ├── app/      ← Pages
    │   ├── components/ ← Reusable UI parts
    │   └── lib/      ← API calls, utilities
    └── ...
```

---

## 🔧 Step-by-Step Setup

### STEP 1: Open Terminal in VS Code

1. Open VS Code
2. Go to `File` → `Open Folder` → Select `D:\Website`
3. Open terminal: `View` → `Terminal` (or press `` Ctrl+` ``)

---

### STEP 2: Setup Backend (Django/Python)

#### 2.1 Navigate to backend folder
```powershell
cd d:\Website\backend
```

#### 2.2 Create a Virtual Environment
A virtual environment keeps your project's packages separate from other projects.

```powershell
python -m venv venv
```

This creates a `venv` folder inside `backend`.

#### 2.3 Activate the Virtual Environment
```powershell
.\venv\Scripts\Activate
```

You should see `(venv)` at the start of your terminal line. This means it's activated!

> ⚠️ **Every time** you open a new terminal to work on backend, you need to activate venv again.

#### 2.4 Install Python Packages
```powershell
pip install -r requirements_dev.txt
```

This installs all the Python libraries the project needs. Wait for it to complete.

#### 2.5 Set the Settings Module
Tell Django to use development settings:

```powershell
$env:DJANGO_SETTINGS_MODULE="soulconnect.settings_dev"
```

> ⚠️ You need to run this command every time you open a new terminal.

#### 2.6 Create Database Tables
```powershell
python manage.py migrate
```

This creates all the database tables. You'll see many lines with "OK".

#### 2.7 Create an Admin User
```powershell
python -c "
import django
django.setup()
from accounts.models import User
if not User.objects.filter(email='admin@soulconnect.com').exists():
    User.objects.create_superuser(email='admin@soulconnect.com', password='Admin@123', first_name='Admin', last_name='User')
    print('Admin user created!')
else:
    print('Admin already exists')
"
```

#### 2.8 Create Sample Subscription Plans
```powershell
python -c "
import django
django.setup()
from payments.models import SubscriptionPlan
plans = [
    {'name': 'Free', 'code': 'FREE', 'price': 0, 'duration_days': 36500, 'description': 'Basic free plan', 'features': ['View 5 profiles per day'], 'is_active': True, 'display_order': 1},
    {'name': 'Gold Monthly', 'code': 'GOLD_MONTHLY', 'price': 99900, 'duration_days': 30, 'description': 'Gold plan', 'features': ['Unlimited profiles', 'Chat with matches'], 'is_active': True, 'is_popular': True, 'display_order': 2},
    {'name': 'Premium Monthly', 'code': 'PREMIUM_MONTHLY', 'price': 199900, 'duration_days': 30, 'description': 'Premium plan', 'features': ['All features unlocked'], 'is_active': True, 'display_order': 3},
]
for p in plans:
    obj, created = SubscriptionPlan.objects.get_or_create(code=p['code'], defaults=p)
    print(f\"{'Created' if created else 'Exists'}: {obj.name}\")
"
```

#### 2.9 Start the Backend Server
```powershell
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

✅ **Backend is running!** Keep this terminal open.

---

### STEP 3: Setup Frontend (Next.js/React)

Open a **NEW** terminal in VS Code (`Ctrl+Shift+`\`).

#### 3.1 Navigate to frontend folder
```powershell
cd d:\Website\frontend
```

#### 3.2 Install Node.js Packages
```powershell
npm install
```

This downloads all JavaScript libraries. May take 1-2 minutes.

#### 3.3 Start the Frontend Server
```powershell
npm run dev
```

You should see:
```
▲ Next.js 14.0.4
- Local: http://localhost:3000
```

If port 3000 is busy, it will use 3001.

✅ **Frontend is running!**

---

## 🌐 Access Your Application

| What | URL |
|------|-----|
| **Main Website** | http://localhost:3000 (or 3001) |
| **Admin Panel** | http://localhost:8000/admin |
| **API Documentation** | http://localhost:8000/api/schema/swagger-ui/ |

### Admin Login:
- Email: `admin@soulconnect.com`
- Password: `Admin@123`

---

## 🔄 Daily Workflow (How to Run Next Time)

### Every time you want to work on this project:

**Terminal 1 - Backend:**
```powershell
cd d:\Website\backend
.\venv\Scripts\Activate
$env:DJANGO_SETTINGS_MODULE="soulconnect.settings_dev"
python manage.py runserver
```

**Terminal 2 - Frontend:**
```powershell
cd d:\Website\frontend
npm run dev
```

---

## 🧪 Testing the Application

1. Open http://localhost:3000 in your browser
2. Click "Register" to create a new account
3. Fill in the registration form
4. Check the backend terminal - you'll see the verification email printed there
5. Log in with your new account
6. Explore: Dashboard, Profile, Search, Settings

---

## 📧 About Emails (Development Mode)

In development mode, emails are NOT actually sent. Instead, they are printed in the backend terminal. Look for lines like:

```
[EMAIL] Verification email sent to user@example.com
```

---

## 🐛 Common Problems & Solutions

### Problem: `python` command not found
**Solution:** Python wasn't added to PATH during installation. Reinstall Python and check "Add to PATH".

### Problem: `npm` command not found
**Solution:** Node.js not installed properly. Reinstall from nodejs.org.

### Problem: "Port 8000 is already in use"
**Solution:** Another program is using port 8000. Either close it or use a different port:
```powershell
python manage.py runserver 8001
```

### Problem: "Module not found" error
**Solution:** Make sure you:
1. Activated venv: `.\venv\Scripts\Activate`
2. Installed packages: `pip install -r requirements_dev.txt`

### Problem: Database errors
**Solution:** Run migrations again:
```powershell
python manage.py migrate
```

### Problem: Frontend shows "Network Error"
**Solution:** Make sure the backend server is running in another terminal.

---

## 📚 Understanding the Tech Stack

| Technology | What it does | Learn more |
|------------|--------------|------------|
| **Python** | Programming language for backend | python.org |
| **Django** | Web framework (handles data, users) | djangoproject.com |
| **Django REST Framework** | Creates the API | django-rest-framework.org |
| **SQLite** | Database (stores all data) | Built into Python |
| **Next.js** | React framework for frontend | nextjs.org |
| **React** | UI library | react.dev |
| **TypeScript** | JavaScript with types | typescriptlang.org |
| **Tailwind CSS** | Styling/CSS framework | tailwindcss.com |

---

## 🛠️ Useful Commands Reference

### Backend Commands
```powershell
# Activate virtual environment
.\venv\Scripts\Activate

# Install new package
pip install package-name

# Create new migration after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser interactively
python manage.py createsuperuser

# Open Django shell
python manage.py shell

# Run tests
python manage.py test
```

### Frontend Commands
```powershell
# Install packages
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

---

## 📞 Need Help?

If you're stuck:
1. Read the error message carefully
2. Google the exact error message
3. Check Stack Overflow
4. Look at Django/Next.js documentation

---

## 🎉 Congratulations!

You've set up a full-stack web application! This is a significant achievement. Keep learning and building!

### Next Steps to Learn:
1. Explore the code files to understand how they work
2. Try making small changes and see what happens
3. Learn more about Django: https://docs.djangoproject.com/
4. Learn more about React/Next.js: https://nextjs.org/learn

