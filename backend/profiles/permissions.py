"""
Custom permissions for profiles app.
"""

from rest_framework import permissions


class IsManager(permissions.BasePermission):
    """
    Permission class to check if user is a manager.
    Only managers can access manager-only endpoints.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_manager_user
        )
