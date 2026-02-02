# KSHATRIYAConnect - Indian Matrimonial Platform
# Backend Django Application

from __future__ import absolute_import, unicode_literals

# This will make sure the app is always imported when Django starts
# Only import Celery if it's installed (production mode)
try:
    from .celery import app as celery_app
    __all__ = ('celery_app',)
except ImportError:
    # Celery not installed - running in development mode
    celery_app = None
    __all__ = ()
