"""
WSGI config for KSHATRIYAConnect project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'soulconnect.settings')

application = get_wsgi_application()
