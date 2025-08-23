from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminUserType(BasePermission):
    """
    Allows access only to users with user_type == 'admin'.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'user_type', None) == 'admin')
